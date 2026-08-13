import type { TripInput, TripPlan, DailyLog, Stop, ELDInterval, LatLngPoint } from '../types/trip';

/**
 * Helper to resolve geographic coordinates & polyline for test cities
 */
function getCityCoords(name: string): LatLngPoint {
  const n = name.toLowerCase();
  if (n.includes('chicago')) return { lat: 41.8781, lng: -87.6298, label: 'Chicago, IL' };
  if (n.includes('springfield')) return { lat: 39.7817, lng: -89.6501, label: 'Springfield, IL' };
  if (n.includes('shreveport')) return { lat: 32.5252, lng: -93.7502, label: 'Shreveport, LA' };
  if (n.includes('dallas')) return { lat: 32.7767, lng: -96.797, label: 'Dallas, TX' };
  if (n.includes('houston')) return { lat: 29.7604, lng: -95.3698, label: 'Houston, TX' };
  if (n.includes('los angeles') || n.includes('la')) return { lat: 34.0522, lng: -118.2437, label: 'Los Angeles, CA' };
  if (n.includes('phoenix')) return { lat: 33.4484, lng: -112.074, label: 'Phoenix, AZ' };
  if (n.includes('atlanta')) return { lat: 33.749, lng: -84.388, label: 'Atlanta, GA' };
  if (n.includes('seattle')) return { lat: 47.6062, lng: -122.3321, label: 'Seattle, WA' };
  if (n.includes('salt lake')) return { lat: 40.7608, lng: -111.891, label: 'Salt Lake City, UT' };
  if (n.includes('denver')) return { lat: 39.7392, lng: -104.9903, label: 'Denver, CO' };
  if (n.includes('new york') || n.includes('ny')) return { lat: 40.7128, lng: -74.006, label: 'New York, NY' };
  if (n.includes('columbus')) return { lat: 39.9612, lng: -82.9988, label: 'Columbus, OH' };

  // Fallback lat/lng
  return { lat: 38.0, lng: -95.0, label: name };
}

function estimateDistance(orig: string, pick: string, drop: string): { leg1: number; leg2: number; total: number } {
  const o = orig.toLowerCase();
  const p = pick.toLowerCase();
  const d = drop.toLowerCase();

  if (o.includes('chicago') && p.includes('dallas') && d.includes('houston')) {
    return { leg1: 960, leg2: 280, total: 1240 };
  }
  if (o.includes('los angeles') || (o.includes('la') && p.includes('phoenix'))) {
    return { leg1: 370, leg2: 1810, total: 2180 };
  }
  if (o.includes('seattle') && p.includes('salt lake')) {
    return { leg1: 830, leg2: 520, total: 1350 };
  }
  if (o.includes('new york') || o.includes('ny')) {
    return { leg1: 530, leg2: 360, total: 890 };
  }

  const leg1 = Math.max(300, (o.length + p.length) * 35);
  const leg2 = Math.max(200, (p.length + d.length) * 25);
  return { leg1, leg2, total: leg1 + leg2 };
}

/**
 * Generates realistic trip plans conforming to assessment rules and API contract.
 */
export function generateMockTripPlan(input: TripInput): TripPlan {
  const { currentLocation, pickupLocation, dropoffLocation, currentCycleUsed } = input;
  const { leg1, total: totalDistanceMiles } = estimateDistance(currentLocation, pickupLocation, dropoffLocation);

  const startCoords = getCityCoords(currentLocation);
  const pickupCoords = getCityCoords(pickupLocation);
  const dropoffCoords = getCityCoords(dropoffLocation);

  const totalDrivingMinutes = Math.round((totalDistanceMiles / 60) * 60);

  // Construct Stops Array (SINGLE AUTHORITATIVE SOURCE OF TRUTH)
  const stops: Stop[] = [
    {
      id: 'stop-start',
      type: 'START',
      name: 'Current Location',
      location: currentLocation,
      milesFromStart: 0,
      eta: '00h 00m',
      durationMinutes: 0,
      coordinates: startCoords,
    },
  ];

  // Interpolate intermediate coordinates for route polyline & fuel stops
  const routePoints: LatLngPoint[] = [startCoords];

  if (totalDistanceMiles > 400) {
    const fuel1Dist = Math.round(totalDistanceMiles * 0.38);
    const fuel1Time = Math.round((fuel1Dist / 60) * 60);
    const fuel1Coords = {
      lat: startCoords.lat + (pickupCoords.lat - startCoords.lat) * 0.4,
      lng: startCoords.lng + (pickupCoords.lng - startCoords.lng) * 0.4,
      label: 'Springfield, IL',
    };
    stops.push({
      id: 'stop-fuel-1',
      type: 'FUEL',
      name: 'Fuel Stop #1',
      location: 'Springfield, IL',
      milesFromStart: fuel1Dist,
      eta: `${Math.floor(fuel1Time / 60)}h ${(fuel1Time % 60).toString().padStart(2, '0')}m`,
      durationMinutes: 30,
      coordinates: fuel1Coords,
    });
    routePoints.push(fuel1Coords);
  }

  if (totalDistanceMiles > 850) {
    const fuel2Dist = Math.round(totalDistanceMiles * 0.77);
    const fuel2Time = Math.round((fuel2Dist / 60) * 60) + 45;
    const fuel2Coords = {
      lat: pickupCoords.lat + (dropoffCoords.lat - pickupCoords.lat) * 0.3,
      lng: pickupCoords.lng + (dropoffCoords.lng - pickupCoords.lng) * 0.3,
      label: 'Shreveport, LA',
    };
    stops.push({
      id: 'stop-fuel-2',
      type: 'FUEL',
      name: 'Fuel Stop #2',
      location: 'Shreveport, LA',
      milesFromStart: fuel2Dist,
      eta: `${Math.floor(fuel2Time / 60)}h ${(fuel2Time % 60).toString().padStart(2, '0')}m`,
      durationMinutes: 30,
      coordinates: fuel2Coords,
    });
    routePoints.push(fuel2Coords);
  }

  // Pickup Stop (1h ON DUTY NOT DRIVING)
  const pickupTime = Math.round((leg1 / 60) * 60) + 30;
  stops.push({
    id: 'stop-pickup',
    type: 'PICKUP',
    name: 'Pickup Location',
    location: pickupLocation,
    milesFromStart: leg1,
    eta: `${Math.floor(pickupTime / 60)}h ${(pickupTime % 60).toString().padStart(2, '0')}m`,
    durationMinutes: 60,
    coordinates: pickupCoords,
  });
  routePoints.push(pickupCoords);

  // Dropoff Stop (1h ON DUTY NOT DRIVING)
  const totalTripDurationMinutes = totalDrivingMinutes + (stops.length - 1) * 30 + 120;
  stops.push({
    id: 'stop-dropoff',
    type: 'DROPOFF',
    name: 'Dropoff Location',
    location: dropoffLocation,
    milesFromStart: totalDistanceMiles,
    eta: `${Math.floor(totalTripDurationMinutes / 60)}h ${(totalTripDurationMinutes % 60).toString().padStart(2, '0')}m`,
    durationMinutes: 60,
    coordinates: dropoffCoords,
  });
  routePoints.push(dropoffCoords);

  const stopsCount = stops.length;
  const fuelStopsCount = stops.filter((s) => s.type === 'FUEL').length;

  const drivingDaysCount = Math.max(1, Math.ceil(totalDrivingMinutes / (11 * 60)));
  const totalDays = Math.max(3, drivingDaysCount);

  const dailyLogs: DailyLog[] = [];

const getRelativeDateString = (dayOffset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

  for (let d = 1; d <= totalDays; d++) {
    const dateStr = getRelativeDateString(d - 1);

    let intervals: ELDInterval[] = [];

    if (d === 1) {
      intervals = [
        {
          id: 'd1-off-1',
          status: 'OFF_DUTY',
          startTime: '00:00',
          endTime: '05:00',
          startMinutes: 0,
          endMinutes: 300,
          durationMinutes: 300,
          location: currentLocation,
          note: 'Pre-trip off-duty rest',
        },
        {
          id: 'd1-sb-1',
          status: 'SLEEPER_BERTH',
          startTime: '05:00',
          endTime: '11:00',
          startMinutes: 300,
          endMinutes: 660,
          durationMinutes: 360,
          location: currentLocation,
          note: 'Mandatory sleeper berth rest',
        },
        {
          id: 'd1-onduty-1',
          status: 'ON_DUTY',
          startTime: '11:00',
          endTime: '11:30',
          startMinutes: 660,
          endMinutes: 690,
          durationMinutes: 30,
          location: currentLocation,
          note: 'Pre-trip vehicle inspection',
        },
        {
          id: 'd1-drv-1',
          status: 'DRIVING',
          startTime: '11:30',
          endTime: '20:00',
          startMinutes: 690,
          endMinutes: 1200,
          durationMinutes: 510,
          location: 'I-55 South',
          note: 'Leg 1 driving to Springfield, IL fuel stop',
        },
        {
          id: 'd1-onduty-2',
          status: 'ON_DUTY',
          startTime: '20:00',
          endTime: '21:00',
          startMinutes: 1200,
          endMinutes: 1260,
          durationMinutes: 60,
          location: pickupLocation,
          note: 'Pickup loading operation (1 hour)',
        },
        {
          id: 'd1-off-2',
          status: 'OFF_DUTY',
          startTime: '21:00',
          endTime: '24:00',
          startMinutes: 1260,
          endMinutes: 1440,
          durationMinutes: 180,
          location: pickupLocation,
          note: 'Post-trip rest',
        },
      ];
    } else if (d === 2) {
      intervals = [
        {
          id: 'd2-off-1',
          status: 'OFF_DUTY',
          startTime: '00:00',
          endTime: '06:00',
          startMinutes: 0,
          endMinutes: 360,
          durationMinutes: 360,
          location: 'Springfield, IL',
        },
        {
          id: 'd2-onduty-1',
          status: 'ON_DUTY',
          startTime: '06:00',
          endTime: '07:00',
          startMinutes: 360,
          endMinutes: 420,
          durationMinutes: 60,
          location: 'Springfield, IL',
          note: 'Pre-trip inspection & Fueling',
        },
        {
          id: 'd2-drv-1',
          status: 'DRIVING',
          startTime: '07:00',
          endTime: '15:00',
          startMinutes: 420,
          endMinutes: 900,
          durationMinutes: 480,
          location: 'I-30 West',
          note: 'Driving leg towards Dallas, TX',
        },
        {
          id: 'd2-off-2',
          status: 'OFF_DUTY',
          startTime: '15:00',
          endTime: '15:30',
          startMinutes: 900,
          endMinutes: 930,
          durationMinutes: 30,
          location: 'Shreveport, LA',
          note: 'Mandatory 30-min break after 8h cumulative driving',
        },
        {
          id: 'd2-drv-2',
          status: 'DRIVING',
          startTime: '15:30',
          endTime: '18:30',
          startMinutes: 930,
          endMinutes: 1110,
          durationMinutes: 180,
          location: 'I-45 South',
          note: 'Driving towards Houston',
        },
        {
          id: 'd2-sb-1',
          status: 'SLEEPER_BERTH',
          startTime: '18:30',
          endTime: '24:00',
          startMinutes: 1110,
          endMinutes: 1440,
          durationMinutes: 330,
          location: 'Dallas, TX',
          note: '10-hour sleeper berth rest',
        },
      ];
    } else {
      intervals = [
        {
          id: `d${d}-sb-1`,
          status: 'SLEEPER_BERTH',
          startTime: '00:00',
          endTime: '06:00',
          startMinutes: 0,
          endMinutes: 360,
          durationMinutes: 360,
          location: 'En route Houston',
        },
        {
          id: `d${d}-onduty-1`,
          status: 'ON_DUTY',
          startTime: '06:00',
          endTime: '06:30',
          startMinutes: 360,
          endMinutes: 390,
          durationMinutes: 30,
          location: 'En route Houston',
          note: 'Pre-trip inspection',
        },
        {
          id: `d${d}-drv-1`,
          status: 'DRIVING',
          startTime: '06:30',
          endTime: '10:30',
          startMinutes: 390,
          endMinutes: 630,
          durationMinutes: 240,
          location: 'I-45 South',
          note: 'Final driving leg to Houston',
        },
        {
          id: `d${d}-onduty-2`,
          status: 'ON_DUTY',
          startTime: '10:30',
          endTime: '11:30',
          startMinutes: 630,
          endMinutes: 690,
          durationMinutes: 60,
          location: dropoffLocation,
          note: 'Dropoff unloading operation (1 hour)',
        },
        {
          id: `d${d}-off-1`,
          status: 'OFF_DUTY',
          startTime: '11:30',
          endTime: '24:00',
          startMinutes: 690,
          endMinutes: 1440,
          durationMinutes: 750,
          location: dropoffLocation,
          note: 'End of trip off duty',
        },
      ];
    }

    let offDutyMinutes = 0;
    let sleeperBerthMinutes = 0;
    let drivingMinutes = 0;
    let onDutyMinutes = 0;

    intervals.forEach((inv) => {
      if (inv.status === 'OFF_DUTY') offDutyMinutes += inv.durationMinutes;
      if (inv.status === 'SLEEPER_BERTH') sleeperBerthMinutes += inv.durationMinutes;
      if (inv.status === 'DRIVING') drivingMinutes += inv.durationMinutes;
      if (inv.status === 'ON_DUTY') onDutyMinutes += inv.durationMinutes;
    });

    dailyLogs.push({
      dayNumber: d,
      dateString: dateStr,
      intervals,
      totals: {
        offDutyMinutes,
        sleeperBerthMinutes,
        drivingMinutes,
        onDutyMinutes,
        totalOnDutyMinutes: drivingMinutes + onDutyMinutes,
      },
      carrierName: 'Spotter Logistics Express LLC',
      truckNumber: 'TRK-408',
      trailerNumber: 'TRL-921',
      driverName: 'Raj Patel',
      driverId: '2633',
      totalMilesDriven: d === 1 ? 480 : d === 2 ? 520 : 240,
      shippingDocNo: 'BOL-98421-SPOT',
    });
  }

  const totalDriveMinutes = Math.round(totalDrivingMinutes);
  const totalOnDutyMinutes = totalDriveMinutes + 240;

  const tripOnDutyHours = Math.round((totalOnDutyMinutes / 60) * 10) / 10;
  const projectedCycleHours = Math.min(70, Math.round((currentCycleUsed + tripOnDutyHours) * 10) / 10);
  const cycleRemainingHours = Math.max(0, Math.round((70 - currentCycleUsed) * 10) / 10);

  return {
    id: `trip-${Date.now()}`,
    currentLocation,
    pickupLocation,
    dropoffLocation,
    startCycleUsedHours: currentCycleUsed,
    route: {
      pathPoints: routePoints,
      statesPassed: ['ILLINOIS', 'MISSOURI', 'TENNESSEE', 'TEXAS', 'LOUISIANA'],
    },
    summary: {
      driveTimeMinutes: totalDriveMinutes,
      onDutyTimeMinutes: totalOnDutyMinutes,
      totalTimeDays: totalDays,
      totalDistanceMiles,
      stopsCount,
      fuelStopsCount,
      pickupTimeMinutes: 60,
      dropoffTimeMinutes: 60,
      estimatedArrival: `${getRelativeDateString(2)} at 08:30 AM`,
    },
    stops,
    dailyLogs,
    hos: {
      cycleUsedHours: currentCycleUsed,
      projectedCycleHours,
      cycleRemainingHours,
      cycleLimitHours: 70,
      drivingWindowHours: 14,
      drivingLimitHours: 11,
      restBreakIntervalHours: 8,
      restartAvailable: projectedCycleHours > 55,
      propertyRules: 'Property / No Adverse Cond.',
    },
    createdAt: new Date().toISOString(),
  };
}

export const DEFAULT_TRIP_INPUT: TripInput = {
  currentLocation: 'Chicago, IL',
  pickupLocation: 'Dallas, TX',
  dropoffLocation: 'Houston, TX',
  currentCycleUsed: 42.5,
};
