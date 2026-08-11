import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

# FMCSA HOS Constants for Property-Carrying Drivers (49 CFR Part 395)
MAX_CYCLE_HOURS: float = 70.0  # 70-hour / 8-day rolling cycle
MAX_DRIVING_SHIFT_MINUTES: int = 11 * 60  # 11 hours = 660 minutes
MAX_DUTY_WINDOW_MINUTES: int = 14 * 60  # 14 hours = 840 minutes
MANDATORY_BREAK_THRESHOLD_MINUTES: int = 8 * 60  # 8 hours = 480 minutes
REST_BREAK_MINUTES: int = 30  # 30-minute rest break
SHIFT_RESET_MINUTES: int = 10 * 60  # 10 hours off-duty / sleeper berth reset
CYCLE_RESTART_MINUTES: int = 34 * 60  # 34 hours off-duty cycle restart

class HOSStateTracker:
  """
  Tracks driver's active shift limits and cycle consumption during trip scheduling.
  """
  def __init__(self, start_cycle_used_hours: float):
    self.start_cycle_used_hours = max(0.0, min(70.0, start_cycle_used_hours))
    self.current_shift_driving_minutes = 0
    self.current_shift_duty_minutes = 0
    self.driving_since_last_break_minutes = 0
    self.total_on_duty_minutes = 0

  @property
  def cycle_remaining_hours(self) -> float:
    return max(0.0, round(MAX_CYCLE_HOURS - (self.start_cycle_used_hours + (self.total_on_duty_minutes / 60.0)), 2))

  @property
  def projected_cycle_hours(self) -> float:
    return round(self.start_cycle_used_hours + (self.total_on_duty_minutes / 60.0), 2)

  def can_drive(self, duration_minutes: int) -> bool:
    """Check if driving duration_minutes violates 11h driving, 14h window, or 70h cycle."""
    if (self.current_shift_driving_minutes + duration_minutes) > MAX_DRIVING_SHIFT_MINUTES:
      return False
    if (self.current_shift_duty_minutes + duration_minutes) > MAX_DUTY_WINDOW_MINUTES:
      return False
    
    additional_cycle_hours = duration_minutes / 60.0
    if (self.start_cycle_used_hours + (self.total_on_duty_minutes / 60.0) + additional_cycle_hours) > MAX_CYCLE_HOURS:
      return False

    return True

  def needs_30min_break(self, planned_driving_minutes: int) -> bool:
    """Check if mandatory 30-minute break is required before or during planned driving."""
    return (self.driving_since_last_break_minutes + planned_driving_minutes) > MANDATORY_BREAK_THRESHOLD_MINUTES

  def record_driving(self, minutes: int):
    self.current_shift_driving_minutes += minutes
    self.current_shift_duty_minutes += minutes
    self.driving_since_last_break_minutes += minutes
    self.total_on_duty_minutes += minutes

  def record_on_duty_not_driving(self, minutes: int):
    self.current_shift_duty_minutes += minutes
    self.total_on_duty_minutes += minutes
    # Note: Non-driving on-duty time satisfies 30m break requirement if >= 30m
    if minutes >= REST_BREAK_MINUTES:
      self.driving_since_last_break_minutes = 0

  def record_rest_break(self, minutes: int = REST_BREAK_MINUTES):
    self.current_shift_duty_minutes += minutes
    # Satisfies 30m break requirement
    self.driving_since_last_break_minutes = 0

  def record_shift_reset(self, minutes: int = SHIFT_RESET_MINUTES):
    """Perform 10-hour off-duty / sleeper berth daily shift reset."""
    self.current_shift_driving_minutes = 0
    self.current_shift_duty_minutes = 0
    self.driving_since_last_break_minutes = 0
    # Off-duty time does NOT consume 70h cycle

  def record_cycle_restart(self, minutes: int = CYCLE_RESTART_MINUTES):
    """Perform 34-hour off-duty cycle restart."""
    self.start_cycle_used_hours = 0.0
    self.current_shift_driving_minutes = 0
    self.current_shift_duty_minutes = 0
    self.driving_since_last_break_minutes = 0
    self.total_on_duty_minutes = 0


def calculate_hos_status(start_cycle_used_hours: float, total_on_duty_minutes: int) -> Dict[str, Any]:
  """
  Calculate summary HOS cycle metrics for API response.
  """
  cycle_used = round(start_cycle_used_hours, 2)
  cycle_remaining = max(0.0, round(MAX_CYCLE_HOURS - cycle_used, 2))
  projected_cycle = round(cycle_used + (total_on_duty_minutes / 60.0), 2)
  is_compliant = projected_cycle <= MAX_CYCLE_HOURS

  return {
    "cycleUsedHours": cycle_used,
    "cycleRemainingHours": cycle_remaining,
    "projectedCycleHours": projected_cycle,
    "isCompliant": is_compliant,
    "dutyRule": "70h / 8-Day Property-Carrying",
  }
