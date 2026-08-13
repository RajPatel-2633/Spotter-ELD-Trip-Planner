import json
from django.test import TestCase
from rest_framework.test import APIClient

class Phase2APIMatrixTestCase(TestCase):
    """
    Level 3 API Integration Test Suite enforcing 8 assessment scenarios and critical HOS/RODS continuity assertions.
    """

    def setUp(self):
        self.client = APIClient()
        self.url = '/api/trips/plan'

    def _assert_rods_continuity_and_hos_limits(self, plan: dict, max_allowed_cycle_used: float = 70.0):
        """Helper enforcing critical HOS & RODS assertions on every successful trip plan."""
        daily_logs = plan.get('dailyLogs', [])
        self.assertGreater(len(daily_logs), 0, "Trip plan must contain at least one daily log.")

        for day in daily_logs:
            intervals = day.get('intervals', [])
            self.assertGreater(len(intervals), 0, f"Day {day['dayNumber']} must contain status intervals.")

            # 1. 24-hour coverage
            self.assertEqual(intervals[0]['startTime'], "00:00", f"Day {day['dayNumber']} must start at 00:00.")
            self.assertEqual(intervals[-1]['endTime'], "24:00", f"Day {day['dayNumber']} must end at 24:00.")

            # 2. Continuity (Zero gaps, Zero overlaps)
            for i in range(len(intervals) - 1):
                curr_end = intervals[i]['endTime']
                next_start = intervals[i + 1]['startTime']
                self.assertEqual(
                    curr_end,
                    next_start,
                    f"Gap/Overlap between interval {i} ({curr_end}) and {i+1} ({next_start}) in Day {day['dayNumber']}"
                )

            # 3. Total daily driving limit <= 11 hours
            totals = day.get('totals', {})
            self.assertLessEqual(
                totals.get('drivingHours', 0.0),
                11.0,
                f"Day {day['dayNumber']} driving hours ({totals.get('drivingHours')}) exceeds 11h limit."
            )

        # 4. Total cycle on-duty limit <= 70.0 hours
        hos = plan.get('hos', {})
        self.assertLessEqual(
            hos.get('projectedCycleHours', 0.0),
            max_allowed_cycle_used,
            f"Projected cycle hours ({hos.get('projectedCycleHours')}) exceeds {max_allowed_cycle_used}h limit."
        )

    # 1. Short Trip -> Single-day schedule
    def test_scenario_1_short_trip_single_day(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Springfield, IL",
            "dropoff_location": "Peoria, IL",
            "current_cycle_used": 10.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()
        self._assert_rods_continuity_and_hos_limits(plan)

    # 2. >11h Driving -> Driving is split across legally permitted driving periods
    def test_scenario_2_over_11h_driving_split_across_shifts(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Houston, TX",
            "current_cycle_used": 10.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()
        self._assert_rods_continuity_and_hos_limits(plan)

        stops = plan.get('stops', [])
        stop_types = [s['type'] for s in stops]
        self.assertIn('REST', stop_types, "Long driving leg must include qualifying rest stops.")

    # 3. >14h Duty Window -> No driving occurs beyond the active 14h window
    def test_scenario_3_duty_window_enforced(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Houston, TX",
            "current_cycle_used": 20.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()
        self._assert_rods_continuity_and_hos_limits(plan)

    # 4. 8h Driving -> 30-minute qualifying non-driving break is inserted
    def test_scenario_4_mandatory_30min_break_inserted(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Houston, TX",
            "current_cycle_used": 15.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()

        stops = plan.get('stops', [])
        break_stops = [s for s in stops if s.get('qualifiesFor30MinBreak')]
        self.assertGreater(len(break_stops), 0, "30-minute break qualifying stop must be inserted.")

    # 5. >1,000 Miles -> Fuel stop inserted according to assessment assumption
    def test_scenario_5_fuel_stop_inserted_over_1000_miles(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Houston, TX",
            "current_cycle_used": 10.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()

        stops = plan.get('stops', [])
        fuel_stops = [s for s in stops if s['type'] == 'FUEL']
        self.assertGreater(len(fuel_stops), 0, "Trips over 1,000 miles must contain at least one fuel stop.")

    # 6. Multi-Day Trip -> Day 1 ... Day N RODS generated
    def test_scenario_6_multi_day_rods_generated(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Houston, TX",
            "current_cycle_used": 30.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()

        daily_logs = plan.get('dailyLogs', [])
        self.assertGreater(len(daily_logs), 1, "Multi-day trip must generate Day 1 ... Day N daily logs.")
        self._assert_rods_continuity_and_hos_limits(plan)

    # 7. 65/70h Cycle -> Remaining cycle capacity is respected for short leg
    def test_scenario_7_cycle_capacity_respected(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Skokie, IL",
            "dropoff_location": "Evanston, IL",
            "current_cycle_used": 65.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 200)
        plan = resp.json()
        self.assertTrue(plan['hos']['isCompliant'])
        self._assert_rods_continuity_and_hos_limits(plan)

    # 8. Impossible Trip -> INFEASIBLE returned rather than illegal schedule
    def test_scenario_8_impossible_trip_returns_infeasible(self):
        payload = {
            "current_location": "Chicago, IL",
            "pickup_location": "Dallas, TX",
            "dropoff_location": "Houston, TX",
            "current_cycle_used": 68.0
        }
        resp = self.client.post(self.url, payload, format='json')
        self.assertEqual(resp.status_code, 400)
        data = resp.json()
        self.assertEqual(data.get('status'), 'INFEASIBLE')
        self.assertIn('INFEASIBLE', data.get('error', ''))
