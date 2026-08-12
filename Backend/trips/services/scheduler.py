import math
from datetime import datetime, timedelta, time, timezone as py_tz
from typing import Dict, Any, List
from django.utils import timezone
from .hos import HOSStateTracker, calculate_hos_status, SHIFT_RESET_MINUTES, REST_BREAK_MINUTES, MAX_CYCLE_HOURS
from .routing import haversine_miles

def interpolate_coordinate(path_points: List[Dict[str, float]], target_miles: float, total_miles: float) -> Dict[str, float]:
  """
  Find (lat, lng) coordinate along route geometry pathPoints at target_miles from start.
  """
  if not path_points or len(path_points) == 0:
    return {"lat": 0.0, "lng": 0.0}
  if target_miles <= 0:
    return path_points[0]
  if target_miles >= total_miles:
    return path_points[-1]

  ratio = target_miles / max(1.0, total_miles)
  index = min(len(path_points) - 1, max(0, int(ratio * len(path_points))))
  return path_points[index]

def format_eta(dt: datetime) -> str:
  """Format datetime into standard 12-hour ETA string (e.g., '07:51 AM')."""
  return dt.strftime("%I:%M %p")

def build_trip_schedule(route_info: Dict[str, Any], start_cycle_used_hours: float, start_time_str: str = None) -> Dict[str, Any]:
  """
  Build multi-day legal trip itinerary stop schedule enforcing FMCSA HOS rules.
  Dynamically uses current system date at 06:00 AM UTC if start_time_str is not provided.
  """
  if not start_time_str:
    current_date = timezone.localdate()
    start_dt = timezone.make_aware(datetime.combine(current_date, time(6, 0)), timezone.get_current_timezone())
  else:
    start_dt = datetime.fromisoformat(start_time_str.replace("Z", "+00:00"))
  current_time = start_dt
  current_miles = 0.0

  total_distance = float(route_info["distanceMiles"])
  total_drive_minutes = int(route_info["driveTimeMinutes"])
  path_points = route_info["pathPoints"]

  origin = route_info["origin"]
  pickup = route_info["pickup"]
  destination = route_info["destination"]

  # Calculate accurate pickup leg mileage ratio
  dist_origin_pickup = haversine_miles((origin["lat"], origin["lng"]), (pickup["lat"], pickup["lng"]))
  dist_pickup_dropoff = haversine_miles((pickup["lat"], pickup["lng"]), (destination["lat"], destination["lng"]))
  total_haversine = dist_origin_pickup + dist_pickup_dropoff
  if total_haversine > 0:
    pickup_mile = round(total_distance * (dist_origin_pickup / total_haversine))
  else:
    pickup_mile = 0

  tracker = HOSStateTracker(start_cycle_used_hours)

  stops: List[Dict[str, Any]] = []
  stop_counter = 1

  # 1. START STOP
  stops.append({
    "id": f"stop-{stop_counter}",
    "type": "START",
    "name": f"Start: {origin['name']}",
    "location": origin["name"],
    "coordinates": {"lat": origin["lat"], "lng": origin["lng"]},
    "milesFromStart": 0,
    "arrival": current_time.isoformat(),
    "departure": current_time.isoformat(),
    "durationMinutes": 0,
    "dutyStatus": "OFF_DUTY",
    "eta": format_eta(current_time),
    "qualifiesFor30MinBreak": False,
  })
  stop_counter += 1

  # 2. DRIVING & INTERMEDIATE STOPS (PICKUP, FUEL & REST) SCHEDULING
  remaining_drive_minutes = total_drive_minutes
  last_fuel_mile = 0.0
  fuel_stop_index = 1
  pickup_performed = False

  avg_speed_mph = (total_distance / max(1.0, total_drive_minutes / 60.0))

  while remaining_drive_minutes > 0:
    # Check if we should insert PICKUP stop when reaching pickup location mileage
    if not pickup_performed and current_miles >= pickup_mile:
      pickup_performed = True
      pickup_arrival = current_time
      pickup_duration = 60
      tracker.record_on_duty_not_driving(pickup_duration)
      current_time += timedelta(minutes=pickup_duration)

      stops.append({
        "id": f"stop-{stop_counter}",
        "type": "PICKUP",
        "name": f"Pickup: {pickup['name']}",
        "location": pickup["name"],
        "coordinates": {"lat": pickup["lat"], "lng": pickup["lng"]},
        "milesFromStart": round(pickup_mile),
        "arrival": pickup_arrival.isoformat(),
        "departure": current_time.isoformat(),
        "durationMinutes": pickup_duration,
        "dutyStatus": "ON_DUTY",
        "eta": format_eta(pickup_arrival),
        "qualifiesFor30MinBreak": True,
      })
      stop_counter += 1

    # Check shift capacity limits (11h driving, 14h duty window)
    driving_capacity = min(
      11 * 60 - tracker.current_shift_driving_minutes,
      14 * 60 - tracker.current_shift_duty_minutes
    )

    if driving_capacity <= 0:
      # Perform 10-hour Overnight Shift Reset
      reset_arrival = current_time
      reset_duration = 600  # 10 hours
      tracker.record_shift_reset(reset_duration)
      current_time += timedelta(minutes=reset_duration)

      coords = interpolate_coordinate(path_points, current_miles, total_distance)
      stops.append({
        "id": f"stop-{stop_counter}",
        "type": "REST",
        "name": f"Overnight Rest (10h Reset)",
        "location": f"Rest Area @ {round(current_miles)} mi",
        "coordinates": coords,
        "milesFromStart": round(current_miles),
        "arrival": reset_arrival.isoformat(),
        "departure": current_time.isoformat(),
        "durationMinutes": reset_duration,
        "dutyStatus": "OFF_DUTY",
        "eta": format_eta(reset_arrival),
        "qualifiesFor30MinBreak": True,
      })
      stop_counter += 1
      continue

    # Check 30-minute mandatory break requirement (after 8h cumulative driving)
    break_capacity = 8 * 60 - tracker.driving_since_last_break_minutes
    if break_capacity <= 0:
      break_arrival = current_time
      break_duration = 30
      tracker.record_rest_break(break_duration)
      current_time += timedelta(minutes=break_duration)

      coords = interpolate_coordinate(path_points, current_miles, total_distance)
      stops.append({
        "id": f"stop-{stop_counter}",
        "type": "REST",
        "name": f"30-Min Rest Break",
        "location": f"Rest Area @ {round(current_miles)} mi",
        "coordinates": coords,
        "milesFromStart": round(current_miles),
        "arrival": break_arrival.isoformat(),
        "departure": current_time.isoformat(),
        "durationMinutes": break_duration,
        "dutyStatus": "OFF_DUTY",
        "eta": format_eta(break_arrival),
        "qualifiesFor30MinBreak": True,
      })
      stop_counter += 1
      continue

    # Determine driving leg size
    drive_chunk = min(remaining_drive_minutes, driving_capacity, break_capacity)

    # Check fuel stop requirement (at least once every 1,000 miles)
    chunk_miles = (drive_chunk / 60.0) * avg_speed_mph
    if (current_miles + chunk_miles - last_fuel_mile) >= 1000:
      fuel_arrival = current_time
      fuel_duration = 30
      tracker.record_on_duty_not_driving(fuel_duration)
      current_time += timedelta(minutes=fuel_duration)
      last_fuel_mile = current_miles + chunk_miles

      coords = interpolate_coordinate(path_points, current_miles, total_distance)
      stops.append({
        "id": f"stop-{stop_counter}",
        "type": "FUEL",
        "name": f"Fuel Stop #{fuel_stop_index}",
        "location": f"En-Route Fuel Station #{fuel_stop_index}",
        "coordinates": coords,
        "milesFromStart": round(current_miles),
        "arrival": fuel_arrival.isoformat(),
        "departure": current_time.isoformat(),
        "durationMinutes": fuel_duration,
        "dutyStatus": "ON_DUTY",
        "eta": format_eta(fuel_arrival),
        "qualifiesFor30MinBreak": True,
      })
      fuel_stop_index += 1
      stop_counter += 1

    # Record driving leg progress
    tracker.record_driving(drive_chunk)
    current_time += timedelta(minutes=drive_chunk)
    current_miles += chunk_miles
    remaining_drive_minutes -= drive_chunk

  # Ensure pickup is recorded if not triggered during loop (e.g. short legs)
  if not pickup_performed:
    pickup_arrival = current_time
    pickup_duration = 60
    tracker.record_on_duty_not_driving(pickup_duration)
    current_time += timedelta(minutes=pickup_duration)

    stops.append({
      "id": f"stop-{stop_counter}",
      "type": "PICKUP",
      "name": f"Pickup: {pickup['name']}",
      "location": pickup["name"],
      "coordinates": {"lat": pickup["lat"], "lng": pickup["lng"]},
      "milesFromStart": round(pickup_mile),
      "arrival": pickup_arrival.isoformat(),
      "departure": current_time.isoformat(),
      "durationMinutes": pickup_duration,
      "dutyStatus": "ON_DUTY",
      "eta": format_eta(pickup_arrival),
      "qualifiesFor30MinBreak": True,
    })
    stop_counter += 1

  # 4. DROPOFF STOP (1 hour ON_DUTY)
  dropoff_arrival = current_time
  dropoff_duration = 60
  tracker.record_on_duty_not_driving(dropoff_duration)
  current_time += timedelta(minutes=dropoff_duration)

  stops.append({
    "id": f"stop-{stop_counter}",
    "type": "DROPOFF",
    "name": f"Dropoff: {destination['name']}",
    "location": destination["name"],
    "coordinates": {"lat": destination["lat"], "lng": destination["lng"]},
    "milesFromStart": round(total_distance),
    "arrival": dropoff_arrival.isoformat(),
    "departure": current_time.isoformat(),
    "durationMinutes": dropoff_duration,
    "dutyStatus": "ON_DUTY",
    "eta": format_eta(dropoff_arrival),
    "qualifiesFor30MinBreak": True,
  })

  # 5. CYCLE FEASIBILITY GUARD
  total_on_duty_minutes = tracker.total_on_duty_minutes
  cycle_remaining_hours = tracker.cycle_remaining_hours
  projected_cycle_hours = tracker.projected_cycle_hours

  if projected_cycle_hours > MAX_CYCLE_HOURS:
    return {
      "is_feasible": False,
      "error": f"INFEASIBLE: The requested trip requires {round(total_on_duty_minutes / 60.0, 1)} on-duty hours, but driver only has {round(MAX_CYCLE_HOURS - start_cycle_used_hours, 1)} hours remaining in 70h cycle."
    }

  # Build HOS Summary Object
  hos_summary = calculate_hos_status(start_cycle_used_hours, total_on_duty_minutes)

  # Format Estimated Arrival String
  estimated_arrival_str = current_time.strftime("%b %d, %Y at %I:%M %p")

  summary = {
    "totalDistanceMiles": round(total_distance),
    "driveTimeMinutes": total_drive_minutes,
    "onDutyTimeMinutes": total_on_duty_minutes,
    "totalTripMinutes": round((current_time - start_dt).total_seconds() / 60),
    "estimatedArrival": estimated_arrival_str,
  }

  return {
    "is_feasible": True,
    "stops": stops,
    "summary": summary,
    "hos": hos_summary,
    "startTime": start_dt.isoformat(),
    "endTime": current_time.isoformat(),
  }
