import uuid
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TripInputSerializer
from .services.routing import get_route
from .services.scheduler import build_trip_schedule
from .services.eld import generate_daily_logs
from .db import save_trip_plan, get_db

logger = logging.getLogger(__name__)

class TripPlanView(APIView):
    """
    POST /api/trips/plan
    Authoritative endpoint generating FMCSA-compliant trip plan, route geometry, stops, and RODS daily logs.
    """

    def post(self, request, *args, **kwargs):
        serializer = TripInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"status": "INVALID_INPUT", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        current_loc = data["current_location"]
        pickup_loc = data["pickup_location"]
        dropoff_loc = data["dropoff_location"]
        cycle_used = data["current_cycle_used"]

        # 1. Routing calculation via OSRM API
        route_info = get_route(current_loc, pickup_loc, dropoff_loc)
        if not route_info.get("success"):
            return Response({
                "status": "ROUTING_ERROR",
                "error": route_info.get("error", "Unable to calculate route geometry.")
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # 2. HOS & Itinerary Stop Scheduling
        schedule_info = build_trip_schedule(route_info, cycle_used)
        if not schedule_info.get("is_feasible"):
            return Response({
                "status": "INFEASIBLE",
                "error": schedule_info.get("error", "Trip cannot be completed within 70h cycle limit.")
            }, status=status.HTTP_400_BAD_REQUEST)

        # 3. 24-Hour Event-Based RODS Daily Log Generation
        daily_logs = generate_daily_logs(schedule_info)

        # 4. Construct Authoritative TripPlan Response
        trip_id = f"trip-{uuid.uuid4().hex[:8]}"

        driver_name = data.get("driver_name", "")

        plan = {
            "id": trip_id,
            "status": "SUCCESS",
            "currentLocation": current_loc,
            "pickupLocation": pickup_loc,
            "dropoffLocation": dropoff_loc,
            "startCycleUsedHours": cycle_used,
            "driverName": driver_name,
            "route": {
                "origin": route_info["origin"],
                "pickup": route_info["pickup"],
                "destination": route_info["destination"],
                "totalDistanceMiles": route_info["distanceMiles"],
                "driveTimeMinutes": route_info["driveTimeMinutes"],
                "pathPoints": route_info["pathPoints"],
            },
            "summary": schedule_info["summary"],
            "hos": schedule_info["hos"],
            "stops": schedule_info["stops"],
            "dailyLogs": daily_logs,
        }

        # 5. Non-blocking persist to MongoDB Atlas
        save_trip_plan(plan)

        return Response(plan, status=status.HTTP_200_OK)


class TripHistoryView(APIView):
    """
    GET /api/trips/history
    Retrieve recent trip plans persisted in MongoDB Atlas.
    Projects lightweight summary payload (excluding heavy map polyline pathPoints) for instant response.
    Returns 503 Service Unavailable if MongoDB is not connected or fails.
    """

    def get(self, request, *args, **kwargs):
        db = get_db()
        if db is None:
            return Response(
                {"error": "Trip history is temporarily unavailable. Database connection not configured."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        try:
            # Project lightweight summary payload excluding heavy pathPoints & dailyLogs
            projection = {
                '_id': 0,
                'route.pathPoints': 0,
                'dailyLogs': 0,
            }
            trips = list(db['trips'].find({}, projection).sort('_id', -1).limit(20))
            return Response(trips, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching trip history from MongoDB Atlas: {e}")
            return Response(
                {"error": f"Error fetching trip history: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
