export interface CompletedTripHistory {
  id: string;
  route: string;
  origin: string;
  destination: string;
  distanceMiles: number;
  durationDays: string;
  completedDate: string;
  driverName: string;
  complianceStatus: 'COMPLIANT' | 'WARNING' | 'VIOLATION';
}

export interface ReportsSummary {
  tripsCompletedCount: number;
  totalMilesDriven: number;
  averageTripTime: string;
  fuelStopsCompleted: number;
  complianceRatePercentage: number;
  tripHistory: CompletedTripHistory[];
}

const getPastDateString = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const MOCK_REPORTS_DATA: ReportsSummary = {
  tripsCompletedCount: 24,
  totalMilesDriven: 28430,
  averageTripTime: '2d 04h',
  fuelStopsCompleted: 42,
  complianceRatePercentage: 100,
  tripHistory: [
    {
      id: 'hist-1',
      route: 'Chicago, IL → Houston, TX',
      origin: 'Chicago, IL',
      destination: 'Houston, TX',
      distanceMiles: 1240,
      durationDays: '3 Days',
      completedDate: getPastDateString(2),
      driverName: 'Raj Patel',
      complianceStatus: 'COMPLIANT',
    },
    {
      id: 'hist-2',
      route: 'Los Angeles, CA → Atlanta, GA',
      origin: 'Los Angeles, CA',
      destination: 'Atlanta, GA',
      distanceMiles: 2180,
      durationDays: '4 Days',
      completedDate: getPastDateString(7),
      driverName: 'Raj Patel',
      complianceStatus: 'COMPLIANT',
    },
    {
      id: 'hist-3',
      route: 'Seattle, WA → Denver, CO',
      origin: 'Seattle, WA',
      destination: 'Denver, CO',
      distanceMiles: 1305,
      durationDays: '3 Days',
      completedDate: getPastDateString(14),
      driverName: 'Raj Patel',
      complianceStatus: 'COMPLIANT',
    },
    {
      id: 'hist-4',
      route: 'New York, NY → Chicago, IL',
      origin: 'New York, NY',
      destination: 'Chicago, IL',
      distanceMiles: 790,
      durationDays: '2 Days',
      completedDate: getPastDateString(21),
      driverName: 'Raj Patel',
      complianceStatus: 'COMPLIANT',
    },
  ],
};
