import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useSavedCities } from '../../src/hooks/useSavedCities';
import { clearPersistedAppStore, useAppStore } from '../../src/store/appStore';
import type { LocationOption } from '../../src/types/location';

const paris: LocationOption = {
  id: 'paris',
  name: 'Paris',
  label: 'Paris, Ile-de-France, France',
  country: 'France',
  region: 'Ile-de-France',
  latitude: 48.8566,
  longitude: 2.3522,
  source: 'search',
};

const berlin: LocationOption = {
  id: 'berlin',
  name: 'Berlin',
  label: 'Berlin, Berlin, Germany',
  country: 'Germany',
  region: 'Berlin',
  latitude: 52.52,
  longitude: 13.405,
  source: 'saved',
};

describe('useSavedCities', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedAppStore();
  });

  it('reports the current location as saved and stores it at the front of the shortlist', () => {
    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [berlin],
      unit: 'celsius',
    });

    const { result } = renderHook(() => useSavedCities());

    expect(result.current.isCurrentLocationSaved).toBe(false);

    act(() => {
      result.current.saveCurrentLocation();
    });

    expect(useAppStore.getState().savedLocations.map((location) => location.id)).toEqual(['paris', 'berlin']);
    expect(renderHook(() => useSavedCities()).result.current.isCurrentLocationSaved).toBe(true);
  });

  it('does nothing when saving or switching without a matching current location', () => {
    useAppStore.setState({
      currentLocation: null,
      geolocationStatus: 'idle',
      savedLocations: [berlin],
      unit: 'celsius',
    });

    const { result } = renderHook(() => useSavedCities());

    act(() => {
      result.current.saveCurrentLocation();
      result.current.switchToSavedLocation('missing-city');
    });

    expect(useAppStore.getState().savedLocations).toEqual([berlin]);
    expect(useAppStore.getState().currentLocation).toBeNull();
    expect(result.current.isCurrentLocationSaved).toBe(false);
  });

  it('switches to a saved location and marks its source as saved', () => {
    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [berlin],
      unit: 'celsius',
    });

    const { result } = renderHook(() => useSavedCities());

    act(() => {
      result.current.switchToSavedLocation('berlin');
    });

    expect(useAppStore.getState().currentLocation).toEqual({
      ...berlin,
      source: 'saved',
    });
  });

  it('deduplicates the active location when saving an existing city again', () => {
    useAppStore.setState({
      currentLocation: {
        ...berlin,
        source: 'search',
      },
      geolocationStatus: 'idle',
      savedLocations: [berlin, paris],
      unit: 'celsius',
    });

    const { result } = renderHook(() => useSavedCities());

    act(() => {
      result.current.saveCurrentLocation();
    });

    expect(useAppStore.getState().savedLocations).toEqual([
      {
        ...berlin,
        source: 'saved',
      },
      paris,
    ]);
    expect(result.current.isCurrentLocationSaved).toBe(true);
  });
});
