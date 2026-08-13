export interface Driver {
  id: string;
  driverId: string;
  name: string;
  carrierName: string;
  truckNo: string;
  trailerNo: string;
  homeTerminal: string;
  cycleUsedHours: number;
  status: 'ACTIVE_DUTY' | 'OFF_DUTY' | 'RESTING';
  complianceStatus: 'COMPLIANT (70hr/8day)' | 'WARNING (Near Limit)';
}

export const DRIVERS_LIST: Driver[] = [
  {
    id: 'drv-1',
    driverId: '2633',
    name: 'Raj Patel',
    carrierName: 'Spotter Freight Logistics Inc.',
    truckNo: 'TRK-408',
    trailerNo: 'TRL-882',
    homeTerminal: 'Chicago, IL',
    cycleUsedHours: 42.5,
    status: 'ACTIVE_DUTY',
    complianceStatus: 'COMPLIANT (70hr/8day)',
  },
  {
    id: 'drv-2',
    driverId: '1042',
    name: 'Sarah Jenkins',
    carrierName: 'Spotter Freight Logistics Inc.',
    truckNo: 'TRK-512',
    trailerNo: 'TRL-301',
    homeTerminal: 'Dallas, TX',
    cycleUsedHours: 24.0,
    status: 'ACTIVE_DUTY',
    complianceStatus: 'COMPLIANT (70hr/8day)',
  },
  {
    id: 'drv-3',
    driverId: '3891',
    name: 'Michael Chang',
    carrierName: 'Spotter Freight Logistics Inc.',
    truckNo: 'TRK-109',
    trailerNo: 'TRL-654',
    homeTerminal: 'Los Angeles, CA',
    cycleUsedHours: 15.5,
    status: 'ACTIVE_DUTY',
    complianceStatus: 'COMPLIANT (70hr/8day)',
  },
  {
    id: 'drv-4',
    driverId: '5520',
    name: 'David Miller',
    carrierName: 'Spotter Freight Logistics Inc.',
    truckNo: 'TRK-774',
    trailerNo: 'TRL-910',
    homeTerminal: 'Atlanta, GA',
    cycleUsedHours: 31.0,
    status: 'ACTIVE_DUTY',
    complianceStatus: 'COMPLIANT (70hr/8day)',
  },
];

export const MOCK_DRIVER_DATA = DRIVERS_LIST[0];
