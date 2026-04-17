import { useCallback, useMemo } from 'react';

import { useAppStore } from '../store/appStore';

export const useSavedCities = () => {
  const currentLocation = useAppStore((state) => state.currentLocation);
  const savedLocations = useAppStore((state) => state.savedLocations);
  const saveLocation = useAppStore((state) => state.saveLocation);
  const removeSavedLocation = useAppStore((state) => state.removeSavedLocation);
  const setCurrentLocation = useAppStore((state) => state.setCurrentLocation);

  const switchToSavedLocation = useCallback(
    (locationId: string) => {
      const savedLocation = savedLocations.find((location) => location.id === locationId);

      if (!savedLocation) {
        return;
      }

      setCurrentLocation({
        ...savedLocation,
        source: 'saved',
      });
    },
    [savedLocations, setCurrentLocation],
  );

  const saveCurrentLocation = useCallback(() => {
    if (!currentLocation) {
      return;
    }

    saveLocation(currentLocation);
  }, [currentLocation, saveLocation]);

  const isCurrentLocationSaved = useMemo(() => {
    if (!currentLocation) {
      return false;
    }

    return savedLocations.some((location) => location.id === currentLocation.id);
  }, [currentLocation, savedLocations]);

  return {
    currentLocation,
    isCurrentLocationSaved,
    removeSavedLocation,
    saveCurrentLocation,
    savedLocations,
    switchToSavedLocation,
  };
};

