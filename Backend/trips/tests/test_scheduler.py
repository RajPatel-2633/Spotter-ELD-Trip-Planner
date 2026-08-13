from django.test import TestCase
from trips.services.scheduler import build_trip_schedule

class TripSchedulerTestCase(TestCase):
    def setUp(self):
        self.mock_route_info = {
            "origin": {"name": "Chicago, IL", "lat": 41.8781, "lng": -87.6298},
            "pickup": {"name": "Dallas, TX", "lat": 32.7767, "lng": -96.7970},
            "destination": {"name": "Houston, TX", "lat": 29.7604, "lng": -95.3698},
            "distanceMiles": 1240,
            "driveTimeMinutes": 1180,
            "pathPoints": [
                {"lat": 41.8781, "lng": -87.6298},
                {"lat": 39.7817, "lng": -89.6501},
                {"lat": 32.5252, "lng": -93.7502},
                {"lat": 32.7767, "lng": -96.7970},
                {"lat": 29.7604, "lng": -95.3698},
            ],
        }

    def test_multi_day_schedule_generation(self):
        schedule = build_trip_schedule(self.mock_route_info, start_cycle_used_hours=42.5)
        self.assertTrue(schedule["is_feasible"])
        stops = schedule["stops"]
        self.assertGreater(len(stops), 3)

        # Verify stop types present
        stop_types = [s["type"] for s in stops]
        self.assertIn("START", stop_types)
        self.assertIn("PICKUP", stop_types)
        self.assertIn("FUEL", stop_types)
        self.assertIn("DROPOFF", stop_types)

    def test_infeasible_cycle_exhaustion_guard(self):
        # 68 hours used out of 70 max -> trip requiring >2h on-duty will be infeasible
        schedule = build_trip_schedule(self.mock_route_info, start_cycle_used_hours=68.0)
        self.assertFalse(schedule["is_feasible"])
        self.assertIn("INFEASIBLE", schedule["error"])
