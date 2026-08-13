import type { TripInput, TripPlan } from '../types/trip';

const getApiBaseUrl = (): string => {
  let url = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').trim().replace(/\/$/, '');
  if (!url.endsWith('/trips')) {
    if (!url.endsWith('/api')) {
      url += '/api';
    }
    url += '/trips';
  }
  return url;
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Pure API client for Spotter TripOS Django REST Backend
 */
export async function postTripPlan(input: TripInput, driverName?: string): Promise<TripPlan> {
  const payload = {
    current_location: input.currentLocation,
    pickup_location: input.pickupLocation,
    dropoff_location: input.dropoffLocation,
    current_cycle_used: input.currentCycleUsed,
    driver_name: driverName || '',
  };

  const response = await fetch(`${API_BASE_URL}/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || data.detail || 'Unable to connect to Spotter TripOS planning service';
    throw new Error(errorMsg);
  }

  return data as TripPlan;
}

/**
 * Fetch saved trip history from MongoDB Atlas via Django GET /api/trips/history
 */
export async function fetchTripHistory(): Promise<TripPlan[]> {
  const response = await fetch(`${API_BASE_URL}/history`);
  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data.error || 'Trip history is temporarily unavailable';
    throw new Error(errorMsg);
  }

  return data as TripPlan[];
}
