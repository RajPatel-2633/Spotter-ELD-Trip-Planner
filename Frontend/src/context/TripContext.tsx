import React, { createContext, useContext, useState, useCallback } from 'react';
import type { TripInput, TripPlan } from '../types/trip';
import { generateMockTripPlan, DEFAULT_TRIP_INPUT } from '../data/mockTripData';
import { postTripPlan } from '../services/tripService';
import { DRIVERS_LIST, type Driver } from '../data/mockDriverData';

export type PlanningStatus = 'idle' | 'planning' | 'success' | 'error';

export interface LoadingStep {
  id: number;
  label: string;
  subLabel: string;
  completed: boolean;
}

export interface TripContextType {
  inputs: TripInput;
  setInputs: React.Dispatch<React.SetStateAction<TripInput>>;
  validationErrors: Record<string, string>;
  status: PlanningStatus;
  loadingStepIndex: number;
  steps: LoadingStep[];
  activeDayIndex: number;
  setActiveDayIndex: (index: number) => void;
  currentPlan: TripPlan | null;
  error: string | null;
  useLiveApi: boolean;
  setUseLiveApi: (useLive: boolean) => void;
  drivers: Driver[];
  selectedDriver: Driver;
  setSelectedDriverId: (driverId: string) => void;
  planTrip: (customInput?: TripInput) => Promise<void>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [drivers] = useState<Driver[]>(DRIVERS_LIST);
  const [selectedDriver, setSelectedDriver] = useState<Driver>(DRIVERS_LIST[0]);

  const [inputs, setInputs] = useState<TripInput>(DEFAULT_TRIP_INPUT);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<PlanningStatus>('idle');
  const [loadingStepIndex, setLoadingStepIndex] = useState<number>(0);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);
  const [currentPlan, setCurrentPlan] = useState<TripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useLiveApi, setUseLiveApi] = useState<boolean>(true);

  const setSelectedDriverId = useCallback((driverId: string) => {
    const found = DRIVERS_LIST.find((d) => d.id === driverId);
    if (found) {
      setSelectedDriver(found);
      setInputs((prev) => ({
        ...prev,
        currentCycleUsed: found.cycleUsedHours,
      }));
    }
  }, []);

  const steps: LoadingStep[] = [
    { id: 1, label: 'Calculating OSRM Route Geometry', subLabel: 'Querying live road network & mileage...', completed: loadingStepIndex > 0 },
    { id: 2, label: 'Evaluating HOS Rules', subLabel: 'Enforcing 70h/8d cycle, 11h driving & 14h window...', completed: loadingStepIndex > 1 },
    { id: 3, label: 'Scheduling Fuel & Rest Stops', subLabel: 'Inserting 1,000mi fuel stops & 30m break...', completed: loadingStepIndex > 2 },
    { id: 4, label: 'Generating FMCSA RODS Logs', subLabel: 'Building 24h event-based daily log intervals...', completed: loadingStepIndex > 3 },
  ];

  const validateInputs = useCallback((data: TripInput): boolean => {
    const errors: Record<string, string> = {};

    if (!data.currentLocation.trim()) {
      errors.currentLocation = 'Current Location is required';
    }
    if (!data.pickupLocation.trim()) {
      errors.pickupLocation = 'Pickup Location is required';
    }
    if (!data.dropoffLocation.trim()) {
      errors.dropoffLocation = 'Dropoff Location is required';
    }
    if (isNaN(data.currentCycleUsed) || data.currentCycleUsed < 0 || data.currentCycleUsed > 70) {
      errors.currentCycleUsed = 'Cycle used must be between 0 and 70 hours';
    }

    if (data.currentLocation.trim().toLowerCase() === data.pickupLocation.trim().toLowerCase()) {
      errors.pickupLocation = 'Pickup must be different from Current Location';
    }
    if (data.pickupLocation.trim().toLowerCase() === data.dropoffLocation.trim().toLowerCase()) {
      errors.dropoffLocation = 'Dropoff must be different from Pickup Location';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, []);

  const planTrip = useCallback(
    async (customInput?: TripInput) => {
      const inputToUse = customInput || inputs;
      if (!validateInputs(inputToUse)) {
        return;
      }

      setStatus('planning');
      setLoadingStepIndex(0);
      setError(null);

      const stepDuration = 250;

      for (let i = 0; i < 4; i++) {
        await new Promise((res) => setTimeout(res, stepDuration));
        setLoadingStepIndex(i + 1);
      }

      try {
        let newPlan: TripPlan;

        if (useLiveApi) {
          newPlan = await postTripPlan(inputToUse, selectedDriver.name);
        } else {
          newPlan = generateMockTripPlan(inputToUse);
        }

        setCurrentPlan(newPlan);
        setActiveDayIndex(0);
        setStatus('success');
      } catch (err: any) {
        setError(err.message || 'Unable to connect to Spotter TripOS planning service');
        setStatus('error');
      }
    },
    [inputs, validateInputs, useLiveApi, selectedDriver.name]
  );

  return (
    <TripContext.Provider
      value={{
        inputs,
        setInputs,
        validationErrors,
        status,
        loadingStepIndex,
        steps,
        activeDayIndex,
        setActiveDayIndex,
        currentPlan,
        error,
        useLiveApi,
        setUseLiveApi,
        drivers,
        selectedDriver,
        setSelectedDriverId,
        planTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export function useTripContext(): TripContextType {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
}
