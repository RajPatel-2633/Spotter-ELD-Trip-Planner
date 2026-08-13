from django.test import TestCase
from trips.services.hos import HOSStateTracker, calculate_hos_status

class HOSTrackerTestCase(TestCase):
    def test_cycle_remaining_calculation(self):
        tracker = HOSStateTracker(start_cycle_used_hours=42.5)
        self.assertEqual(tracker.cycle_remaining_hours, 27.5)
        self.assertEqual(tracker.projected_cycle_hours, 42.5)

    def test_driving_limits_and_break_trigger(self):
        tracker = HOSStateTracker(start_cycle_used_hours=10.0)
        # Drive 5 hours (300 mins)
        self.assertTrue(tracker.can_drive(300))
        tracker.record_driving(300)
        self.assertFalse(tracker.needs_30min_break(100))  # 400 < 480 mins

        # Drive additional 3.5 hours (210 mins) -> 510 mins total (> 480 mins)
        self.assertTrue(tracker.needs_30min_break(210))

    def test_shift_reset_and_cycle_restart(self):
        tracker = HOSStateTracker(start_cycle_used_hours=50.0)
        tracker.record_driving(600)  # 10 hours driving
        self.assertEqual(tracker.current_shift_driving_minutes, 600)

        # 10h Shift reset resets current shift driving & duty
        tracker.record_shift_reset()
        self.assertEqual(tracker.current_shift_driving_minutes, 0)
        self.assertEqual(tracker.current_shift_duty_minutes, 0)
        # Cycle used still reflects total on duty
        self.assertEqual(tracker.projected_cycle_hours, 60.0)

        # 34h Cycle restart resets cycle used
        tracker.record_cycle_restart()
        self.assertEqual(tracker.start_cycle_used_hours, 0.0)
        self.assertEqual(tracker.projected_cycle_hours, 0.0)

    def test_hos_summary_calculation(self):
        summary = calculate_hos_status(start_cycle_used_hours=42.5, total_on_duty_minutes=1200)
        self.assertEqual(summary["cycleUsedHours"], 42.5)
        self.assertEqual(summary["cycleRemainingHours"], 27.5)
        self.assertEqual(summary["projectedCycleHours"], 62.5)
        self.assertTrue(summary["isCompliant"])
