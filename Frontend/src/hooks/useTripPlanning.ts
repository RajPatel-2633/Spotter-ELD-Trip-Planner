import { useTripContext } from '../context/TripContext';

/**
 * Convenient wrapper hook consuming shared TripContext
 */
export function useTripPlanning() {
  return useTripContext();
}
