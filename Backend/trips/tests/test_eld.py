from datetime import timedelta
from django.utils import timezone
from django.test import TestCase
from trips.services.eld import generate_daily_logs, validate_eld_intervals

class ELDRODSTestCase(TestCase):
    def setUp(self):
        now_dt = timezone.now()
        end_dt = now_dt + timedelta(days=2)
        self.mock_schedule = {
            "startTime": now_dt.isoformat(),
            "endTime": end_dt.isoformat(),
            "stops": [
                {"location": "Chicago, IL", "type": "START"},
                {"location": "Dallas, TX", "type": "PICKUP"},
                {"location": "Houston, TX", "type": "DROPOFF"},
            ],
        }

    def test_eld_intervals_cover_full_24h_day(self):
        logs = generate_daily_logs(self.mock_schedule)
        self.assertGreater(len(logs), 0)

        for log in logs:
            intervals = log["intervals"]
            self.assertTrue(validate_eld_intervals(intervals), f"Interval continuity failed for {log['id']}")
            self.assertEqual(intervals[0]["startTime"], "00:00")
            self.assertEqual(intervals[-1]["endTime"], "24:00")

    def test_eld_intervals_no_overlaps_or_gaps(self):
        logs = generate_daily_logs(self.mock_schedule)
        for log in logs:
            intervals = log["intervals"]
            for i in range(len(intervals) - 1):
                self.assertEqual(
                    intervals[i]["endTime"],
                    intervals[i + 1]["startTime"],
                    f"Gap or overlap detected between interval {i} and {i+1} in {log['id']}"
                )

    def test_eld_daily_totals_sum_to_24h(self):
        logs = generate_daily_logs(self.mock_schedule)
        for log in logs:
            totals = log["totals"]
            total_sum = round(
                totals["drivingHours"] + totals["onDutyHours"] + totals["offDutyHours"] + totals["sleeperBerthHours"],
                2
            )
            self.assertEqual(total_sum, 24.0, f"Daily hour total sum is {total_sum}, expected 24.0 in {log['id']}")
