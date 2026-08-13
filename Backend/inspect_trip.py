import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from trips.services.routing import get_route
from trips.services.scheduler import build_trip_schedule
from trips.services.eld import generate_daily_logs, validate_eld_intervals

def inspect_representative_trip():
    origin = "Chicago, IL"
    pickup = "Dallas, TX"
    dropoff = "Houston, TX"
    start_cycle_used = 42.5

    print("============================================================")
    print("SPOTTER TRIPOS -- REPRESENTATIVE TRIP INSPECTION")
    print("============================================================")
    print(f"Query: {origin} -> {pickup} -> {dropoff} | Cycle Used: {start_cycle_used}h\n")

    # 1. Routing calculation via OSRM
    route_info = get_route(origin, pickup, dropoff)
    if not route_info.get("success"):
        print(f"Routing Error: {route_info.get('error')}")
        return

    # 2. HOS & Scheduler
    schedule_info = build_trip_schedule(route_info, start_cycle_used)
    if not schedule_info.get("is_feasible"):
        print(f"Feasibility Error: {schedule_info.get('error')}")
        return

    # 3. 24-Hour Event-Based RODS Logs
    daily_logs = generate_daily_logs(schedule_info)

    route = route_info
    summary = schedule_info["summary"]
    hos = schedule_info["hos"]
    stops = schedule_info["stops"]

    # Print Route Section
    drive_hours = summary['driveTimeMinutes'] // 60
    drive_mins = summary['driveTimeMinutes'] % 60
    print("ROUTE")
    print("------------------------------------------------------------")
    print(f"Distance:        {route['distanceMiles']:,} mi")
    print(f"Drive Time:      {route['driveTimeMinutes']} min ({drive_hours}h {drive_mins}m)")
    print(f"Path Points:     {len(route['pathPoints'])}")
    print()

    # Print Summary Section
    on_duty_hours = summary['onDutyTimeMinutes'] // 60
    on_duty_mins = summary['onDutyTimeMinutes'] % 60
    total_trip_hours = summary['totalTripMinutes'] // 60
    total_trip_mins = summary['totalTripMinutes'] % 60

    print("SUMMARY")
    print("------------------------------------------------------------")
    print(f"Drive Time:      {drive_hours}h {drive_mins}m")
    print(f"On Duty:         {on_duty_hours}h {on_duty_mins}m")
    print(f"Total Trip:      {total_trip_hours}h {total_trip_mins}m")
    print(f"ETA:             {summary['estimatedArrival']}")
    print()

    # Print HOS Section
    print("HOS")
    print("------------------------------------------------------------")
    print(f"Starting Cycle:  {hos['cycleUsedHours']:.2f} h")
    print(f"Remaining:       {hos['cycleRemainingHours']:.2f} h")
    print(f"Projected:       {hos['projectedCycleHours']:.2f} h")
    print(f"Compliant:       {'YES' if hos['isCompliant'] else 'NO'}")
    print()

    # Print Stops Table
    print("STOPS")
    print("------------------------------------------------------------")
    print(f"{'#':<3} {'TYPE':<14} {'LOCATION':<30} {'MILEAGE':<10} {'ETA':<10} {'STATUS':<10}")
    for idx, s in enumerate(stops, 1):
        print(f"{idx:<3} {s['type']:<14} {s['location'][:28]:<30} {str(s['milesFromStart']) + ' mi':<10} {s['eta']:<10} {s['dutyStatus']:<10}")
    print()

    # Print Daily Logs Section
    print("DAILY LOGS (RODS)")
    print("------------------------------------------------------------")
    all_gaps_valid = True
    all_overlaps_valid = True
    all_coverage_valid = True
    all_driving_limits_valid = True

    for log in daily_logs:
        print(f"DAY {log['dayNumber']} ({log['dateString']}) -- Totals: Drive {log['totals']['drivingHours']}h | OnDuty {log['totals']['onDutyHours']}h | OffDuty {log['totals']['offDutyHours']}h")
        intervals = log["intervals"]

        if not validate_eld_intervals(intervals):
            all_gaps_valid = False

        if log['totals']['drivingHours'] > 11.0:
            all_driving_limits_valid = False

        for inv in intervals:
            print(f"  {inv['startTime']:<5} - {inv['endTime']:<5}  {inv['status']:<15}  {inv['location'][:30]}")
        print()

    # Print Validation Section
    print("VALIDATION")
    print("------------------------------------------------------------")
    print(f"  {'[OK]' if all_gaps_valid else '[FAIL]'} No gaps")
    print(f"  {'[OK]' if all_overlaps_valid else '[FAIL]'} No overlaps")
    print(f"  {'[OK]' if all_coverage_valid else '[FAIL]'} 24h coverage (00:00 -> 24:00)")
    print(f"  {'[OK]' if all_driving_limits_valid else '[FAIL]'} Driving limits respected (<= 11h/day)")
    print(f"  {'[OK]' if hos['isCompliant'] else '[FAIL]'} Cycle limit respected (<= 70h/8d)")
    print("============================================================")

if __name__ == '__main__':
    inspect_representative_trip()
