export type DutyStatus = 'OFF_DUTY' | 'SLEEPER_BERTH' | 'DRIVING' | 'ON_DUTY';

export interface ELDInterval {
  id: string;
  status: DutyStatus;
  startTime: string; // e.g. "00:00", "08:30"
  endTime: string;   // e.g. "05:00", "12:00"
  startMinute?: number; // 0..1440 from Django API
  endMinute?: number;   // 0..1440 from Django API
  startMinutes?: number; // 0..1440 legacy alias
  endMinutes?: number;   // 0..1440 legacy alias
  durationMinutes: number;
  location?: string;
  note?: string;
}

export interface DailyLog {
  dayNumber: number;
  dateString: string; // e.g. "May 18, 2025"
  intervals: ELDInterval[];
  totals: {
    drivingHours?: number;
    onDutyHours?: number;
    offDutyHours?: number;
    sleeperBerthHours?: number;
    totalHours?: number;
    offDutyMinutes?: number;
    sleeperBerthMinutes?: number;
    drivingMinutes?: number;
    onDutyMinutes?: number;
    totalOnDutyMinutes?: number;
  };
  carrierName?: string;
  truckNumber?: string;
  trailerNumber?: string;
  driverName?: string;
  driverId?: string;
  totalMilesDriven?: number;
  shippingDocNo?: string;
}

export type StopType = 'START' | 'FUEL' | 'REST' | 'PICKUP' | 'DROPOFF';

export interface LatLngPoint {
  lat: number;
  lng: number;
  label?: string;
}

export interface Stop {
  id: string;
  type: StopType;
  name: string;
  location: string;
  milesFromStart: number;
  eta: string;
  durationMinutes: number;
  coordinates: LatLngPoint;
}

export interface RouteGeometry {
  pathPoints: LatLngPoint[];
  statesPassed: string[];
}

export interface TripSummaryData {
  driveTimeMinutes: number;
  onDutyTimeMinutes: number;
  totalTimeDays: number;
  totalDistanceMiles: number;
  stopsCount: number;
  fuelStopsCount: number;
  pickupTimeMinutes: number;
  dropoffTimeMinutes: number;
  estimatedArrival: string;
  totalTripMinutes?: number;
}

export interface HOSStatusData {
  cycleUsedHours: number;
  projectedCycleHours: number;
  cycleRemainingHours: number;
  cycleLimitHours?: number;
  drivingWindowHours?: number;
  drivingLimitHours?: number;
  restBreakIntervalHours?: number;
  restartAvailable?: boolean;
  propertyRules?: string;
  isCompliant?: boolean;
}

export interface TripPlan {
  id: string;
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  startCycleUsedHours: number;
  route: RouteGeometry;
  summary: TripSummaryData;
  stops: Stop[];
  dailyLogs: DailyLog[];
  hos: HOSStatusData;
  createdAt: string;
  driverName?: string;
}

export interface TripInput {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycleUsed: number;
}
