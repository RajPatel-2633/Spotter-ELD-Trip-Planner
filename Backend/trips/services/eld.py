from datetime import datetime, timedelta, timezone
from typing import Dict, Any, List

def format_minute_time(total_minutes: int) -> str:
  """Convert minutes from midnight (0-1440) to 'HH:MM' string (e.g. 450 -> '07:30')."""
  hours = min(24, total_minutes // 60)
  mins = total_minutes % 60
  if hours == 24:
    return "24:00"
  return f"{hours:02d}:{mins:02d}"

def validate_eld_intervals(intervals: List[Dict[str, Any]]) -> bool:
  """
  Validate that a day's ELD interval chain covers the full 24 hours (00:00 to 24:00) with zero gaps and zero overlaps.
  """
  if not intervals or len(intervals) == 0:
    return False

  if intervals[0]["startTime"] != "00:00":
    return False

  if intervals[-1]["endTime"] != "24:00":
    return False

  for i in range(len(intervals) - 1):
    curr_end = intervals[i]["endTime"]
    next_start = intervals[i + 1]["startTime"]
    if curr_end != next_start:
      return False

  return True

def generate_daily_logs(schedule_info: Dict[str, Any]) -> List[Dict[str, Any]]:
  """
  Generate event-based FMCSA 24-hour Driver's Daily Log / RODS intervals for each day of the trip schedule,
  derived 100% dynamically from the authoritative scheduled event timeline in stops[].
  """
  stops = schedule_info["stops"]
  start_dt = datetime.fromisoformat(schedule_info["startTime"].replace("Z", "+00:00"))
  end_dt = datetime.fromisoformat(schedule_info["endTime"].replace("Z", "+00:00"))

  # 1. Build continuous event timeline from 00:00 on Day 1 to 24:00 on final day
  trip_start_date = start_dt.date()
  timeline_start = datetime(trip_start_date.year, trip_start_date.month, trip_start_date.day, 0, 0, 0, tzinfo=timezone.utc)

  trip_end_date = end_dt.date()
  timeline_end = datetime(trip_end_date.year, trip_end_date.month, trip_end_date.day, 0, 0, 0, tzinfo=timezone.utc) + timedelta(days=1)

  raw_segments: List[Dict[str, Any]] = []

  # Pre-trip off-duty segment from 00:00 on Day 1 until start_dt (e.g. 06:00 AM)
  if start_dt > timeline_start:
    raw_segments.append({
      "start": timeline_start,
      "end": start_dt,
      "status": "OFF_DUTY",
      "location": stops[0]["location"],
      "note": "Pre-shift Off Duty",
    })

  current_t = start_dt

  # Loop over stop events to build exact driving and operational segments
  for idx in range(1, len(stops)):
    stop = stops[idx]
    arr_str = stop.get("arrival", start_dt.isoformat())
    dep_str = stop.get("departure", arr_str)
    stop_arrival = datetime.fromisoformat(arr_str.replace("Z", "+00:00"))
    stop_departure = datetime.fromisoformat(dep_str.replace("Z", "+00:00"))

    # Driving segment prior to stop arrival
    if stop_arrival > current_t:
      raw_segments.append({
        "start": current_t,
        "end": stop_arrival,
        "status": "DRIVING",
        "location": "En-Route Linehaul Corridor",
        "note": f"En-Route Driving to {stop.get('location', 'Destination')}",
      })
      current_t = stop_arrival

    # Scheduled stop event duration
    duration_mins = stop.get("durationMinutes", 0)
    if duration_mins > 0:
      duty = stop.get("dutyStatus", "ON_DUTY" if stop.get("type") in ["PICKUP", "DROPOFF", "FUEL"] else "OFF_DUTY")
      stop_name = stop.get("name", f"Stop: {stop.get('type', 'STOP')}")
      note = f"Stop: {stop_name}"
      if stop.get("type") == "REST":
        note = "Mandatory 10h Reset" if duration_mins >= 600 else "30-Min Rest Break"
      elif stop.get("type") == "FUEL":
        note = "En-Route Fueling"
      elif stop.get("type") == "PICKUP":
        note = "Pickup Loading & Inspection"
      elif stop.get("type") == "DROPOFF":
        note = "Unloading & Post-Trip Inspection"

      raw_segments.append({
        "start": current_t,
        "end": stop_departure,
        "status": duty,
        "location": stop.get("location", ""),
        "note": note,
      })
      current_t = stop_departure

  # Post-trip off-duty segment from final departure to midnight 24:00 of final day
  if current_t < timeline_end:
    raw_segments.append({
      "start": current_t,
      "end": timeline_end,
      "status": "OFF_DUTY",
      "location": stops[-1]["location"],
      "note": "Post-Trip Off Duty",
    })

  # 2. Slice continuous timeline into 24-hour daily log sheets (00:00 -> 24:00)
  total_days = (trip_end_date - trip_start_date).days + 1
  daily_logs: List[Dict[str, Any]] = []

  for day_idx in range(total_days):
    day_number = day_idx + 1
    day_date = trip_start_date + timedelta(days=day_idx)
    date_str = day_date.strftime("%b %d, %Y")

    day_start_dt = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0, tzinfo=timezone.utc)
    day_end_dt = day_start_dt + timedelta(days=1)

    day_intervals: List[Dict[str, Any]] = []

    for seg in raw_segments:
      seg_start = max(seg["start"], day_start_dt)
      seg_end = min(seg["end"], day_end_dt)

      if seg_start < seg_end:
        start_min = int((seg_start - day_start_dt).total_seconds() // 60)
        end_min = int((seg_end - day_start_dt).total_seconds() // 60)
        dur = end_min - start_min

        # Merge adjacent intervals with matching duty status within the same day
        if day_intervals and day_intervals[-1]["status"] == seg["status"]:
          day_intervals[-1]["endMinute"] = end_min
          day_intervals[-1]["endTime"] = format_minute_time(end_min)
          day_intervals[-1]["durationMinutes"] += dur
        else:
          day_intervals.append({
            "id": f"inv-d{day_number}-{len(day_intervals) + 1}",
            "status": seg["status"],
            "startTime": format_minute_time(start_min),
            "endTime": format_minute_time(end_min),
            "startMinute": start_min,
            "endMinute": end_min,
            "durationMinutes": dur,
            "location": seg["location"],
            "note": seg["note"],
          })

    # Validate 24h continuity (00:00 -> 24:00, zero gaps, zero overlaps)
    assert validate_eld_intervals(day_intervals), f"ELD interval continuity validation failed for Day {day_number}"

    # Calculate daily totals
    driving_mins = sum(inv["durationMinutes"] for inv in day_intervals if inv["status"] == "DRIVING")
    on_duty_mins = sum(inv["durationMinutes"] for inv in day_intervals if inv["status"] == "ON_DUTY")
    off_duty_mins = sum(inv["durationMinutes"] for inv in day_intervals if inv["status"] == "OFF_DUTY")
    sleeper_mins = sum(inv["durationMinutes"] for inv in day_intervals if inv["status"] == "SLEEPER_BERTH")

    totals = {
      "drivingHours": round(driving_mins / 60.0, 2),
      "onDutyHours": round(on_duty_mins / 60.0, 2),
      "offDutyHours": round(off_duty_mins / 60.0, 2),
      "sleeperBerthHours": round(sleeper_mins / 60.0, 2),
      "totalHours": 24.0,
    }

    daily_logs.append({
      "id": f"log-day-{day_number}",
      "dayNumber": day_number,
      "dateString": date_str,
      "intervals": day_intervals,
      "totals": totals,
    })

  return daily_logs
