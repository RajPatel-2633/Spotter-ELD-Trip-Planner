import os
import sys
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()

from trips.services.routing import get_route
from trips.services.scheduler import build_trip_schedule
from trips.services.eld import generate_daily_logs
from trips.db import save_trip_plan, get_db

logger = logging.getLogger(__name__)

SEED_ROUTES = [
    {
        "id": "trip-seed-001",
        "current_location": "Chicago, IL",
        "pickup_location": "Dallas, TX",
        "dropoff_location": "Houston, TX",
        "current_cycle_used": 42.5,
    },
    {
        "id": "trip-seed-002",
        "current_location": "Los Angeles, CA",
        "pickup_location": "Phoenix, AZ",
        "dropoff_location": "Atlanta, GA",
        "current_cycle_used": 24.0,
    },
    {
        "id": "trip-seed-003",
        "current_location": "Seattle, WA",
        "pickup_location": "Denver, CO",
        "dropoff_location": "Denver, CO",
        "current_cycle_used": 15.5,
    },
    {
        "id": "trip-seed-004",
        "current_location": "New York, NY",
        "pickup_location": "Pittsburgh, PA",
        "dropoff_location": "Chicago, IL",
        "current_cycle_used": 31.0,
    },
    {
        "id": "trip-seed-005",
        "current_location": "Springfield, IL",
        "pickup_location": "Peoria, IL",
        "dropoff_location": "St. Louis, MO",
        "current_cycle_used": 8.0,
    },
]

def seed_mongodb_atlas():
    print("============================================================")
    print("SEEDING MONGODB ATLAS WITH REASONABLE TRIPS")
    print("============================================================")

    db = get_db()
    if db is None:
        print("MongoDB Atlas client not connected. Skipping seed.")
        return

    trips_coll = db['trips']
    existing_count = trips_coll.count_documents({})
    print(f"Current documents in MongoDB Atlas 'trips': {existing_count}")

    seeded_count = 0
    for route_spec in SEED_ROUTES:
        trip_id = route_spec["id"]
        if trips_coll.find_one({"id": trip_id}):
            print(f"Trip {trip_id} already exists in Atlas. Skipping.")
            continue

        print(f"Calculating & Seeding: {route_spec['current_location']} -> {route_spec['pickup_location']} -> {route_spec['dropoff_location']}...")
        route_info = get_route(route_spec["current_location"], route_spec["pickup_location"], route_spec["dropoff_location"])
        if not route_info.get("success"):
            print(f"Failed to calculate route for {trip_id}: {route_info.get('error')}")
            continue

        schedule_info = build_trip_schedule(route_info, route_spec["current_cycle_used"])
        if not schedule_info.get("is_feasible"):
            print(f"Trip {trip_id} infeasible: {schedule_info.get('error')}")
            continue

        daily_logs = generate_daily_logs(schedule_info)

        plan = {
            "id": trip_id,
            "status": "SUCCESS",
            "currentLocation": route_spec["current_location"],
            "pickupLocation": route_spec["pickup_location"],
            "dropoffLocation": route_spec["dropoff_location"],
            "startCycleUsedHours": route_spec["current_cycle_used"],
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

        save_trip_plan(plan)
        seeded_count += 1

    print(f"Seeding finished. Added {seeded_count} new trips to MongoDB Atlas.")
    print(f"Total documents in Atlas: {trips_coll.count_documents({})}")
    print("============================================================")

if __name__ == '__main__':
    seed_mongodb_atlas()
