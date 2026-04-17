import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { GeolocationStatus, LocationOption, TemperatureUnit } from '../types/location';

const APP_STORAGE_KEY = 'weatherbox-app-state';

interface AppState {
  hasHydrated: boolean;
  unit: TemperatureUnit;
  currentLocation: LocationOption | null;
  savedLocations: LocationOption[];
  geolocationStatus: GeolocationStatus;
  setHasHydrated: (hasHydrated: boolean) => void;
  setUnit: (unit: TemperatureUnit) => void;
  setCurrentLocation: (location: LocationOption | null) => void;
  saveLocation: (location: LocationOption) => void;
  removeSavedLocation: (locationId: string) => void;
  setGeolocationStatus: (status: GeolocationStatus) => void;
}

const baseState = {
  hasHydrated: false,
  unit: 'celsius' as TemperatureUnit,
  currentLocation: null as LocationOption | null,
  savedLocations: [] as LocationOption[],
  geolocationStatus: 'idle' as GeolocationStatus,
};

const asSavedLocation = (location: LocationOption): LocationOption => ({
  ...location,
  source: 'saved',
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...baseState,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setUnit: (unit) => set({ unit }),
      setCurrentLocation: (location) => set({ currentLocation: location }),
      saveLocation: (location) =>
        set((state) => {
          const nextLocation = asSavedLocation(location);
          const existing = state.savedLocations.filter((savedLocation) => savedLocation.id !== nextLocation.id);

          return {
            savedLocations: [nextLocation, ...existing],
          };
        }),
      removeSavedLocation: (locationId) =>
        set((state) => {
          const remainingLocations = state.savedLocations.filter((savedLocation) => savedLocation.id !== locationId);

          if (state.currentLocation?.id !== locationId) {
            return {
              savedLocations: remainingLocations,
            };
          }

          return {
            savedLocations: remainingLocations,
            currentLocation: remainingLocations[0] ? asSavedLocation(remainingLocations[0]) : null,
          };
        }),
      setGeolocationStatus: (status) => set({ geolocationStatus: status }),
    }),
    {
      name: APP_STORAGE_KEY,
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate app state.', error);
        }

        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        unit: state.unit,
        currentLocation: state.currentLocation,
        savedLocations: state.savedLocations,
      }),
    },
  ),
);

export const resetAppStore = (): void => {
  useAppStore.setState(baseState);
};

export const clearPersistedAppStore = (): void => {
  useAppStore.persist.clearStorage();
  resetAppStore();
};

