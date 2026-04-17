import { useCallback, useState } from 'react';

import { useAppStore } from '../store/appStore';

const GEOLOCATION_TIMEOUT_MS = 10000;
const GEOLOCATION_MAXIMUM_AGE_MS = 300000;

const GEOLOCATION_DENIED = 1;
const GEOLOCATION_UNAVAILABLE = 2;

export const useGeolocation = () => {
  const currentLocation = useAppStore((state) => state.currentLocation);
  const geolocationStatus = useAppStore((state) => state.geolocationStatus);
  const setCurrentLocation = useAppStore((state) => state.setCurrentLocation);
  const setGeolocationStatus = useAppStore((state) => state.setGeolocationStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestCurrentLocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setGeolocationStatus('unsupported');
      setErrorMessage('Your browser does not support location access. Search for a city instead.');
      return false;
    }

    setGeolocationStatus('requesting');
    setErrorMessage(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: GEOLOCATION_TIMEOUT_MS,
          maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
        });
      });

      const nextLocation = {
        id: `geo-${position.coords.latitude.toFixed(3)}-${position.coords.longitude.toFixed(3)}`,
        name: 'Current location',
        label: `Current location (${position.coords.latitude.toFixed(2)}, ${position.coords.longitude.toFixed(2)})`,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: 'geolocation' as const,
      };

      setCurrentLocation(nextLocation);
      setGeolocationStatus('granted');
      return true;
    } catch (error) {
      console.error('Failed to access geolocation.', error);

      const geolocationError = error as GeolocationPositionError;

      if (geolocationError.code === GEOLOCATION_DENIED) {
        setGeolocationStatus('denied');
        setErrorMessage('Location access was denied. Search for a city instead.');
        return false;
      }

      if (geolocationError.code === GEOLOCATION_UNAVAILABLE) {
        setGeolocationStatus('error');
        setErrorMessage('Location access is unavailable right now. Search for a city instead.');
        return false;
      }

      setGeolocationStatus('error');
      setErrorMessage('We could not read your location. Search for a city instead.');
      return false;
    }
  }, [setCurrentLocation, setGeolocationStatus]);

  const clearGeolocationError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return {
    clearGeolocationError,
    currentLocation,
    errorMessage,
    geolocationStatus,
    requestCurrentLocation,
  };
};

