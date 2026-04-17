import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSavedCities } from '../../src/hooks/useSavedCities';
import { useUnitPreference } from '../../src/hooks/useUnitPreference';
import { useWeather } from '../../src/hooks/useWeather';
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
  timezone: 'Europe/Paris',
  source: 'search',
};

const berlin: LocationOption = {
  id: 'berlin',
  name: 'Berlin',
  label: 'Berlin, Germany',
  country: 'Germany',
  region: 'Berlin',
  latitude: 52.52,
  longitude: 13.405,
  timezone: 'Europe/Berlin',
  source: 'saved',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('weather foundation hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedAppStore();
    vi.restoreAllMocks();
  });

  it('loads a forecast using the persisted unit and selected location', async () => {
    useAppStore.setState({
      ...useAppStore.getState(),
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [paris],
      unit: 'fahrenheit',
    });

    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'Europe/Paris',
        timezone_abbreviation: 'CEST',
        current_units: {
          temperature_2m: '°F',
          apparent_temperature: '°F',
          wind_speed_10m: 'mph',
        },
        current: {
          time: '2026-04-18T12:00',
          interval: 900,
          temperature_2m: 72.4,
          apparent_temperature: 74.2,
          is_day: 1,
          weather_code: 63,
          wind_speed_10m: 12.1,
        },
        hourly_units: {
          temperature_2m: '°F',
          precipitation_probability: '%',
        },
        hourly: {
          time: ['2026-04-18T12:00'],
          temperature_2m: [72.4],
          precipitation_probability: [35],
          weather_code: [63],
        },
        daily_units: {
          temperature_2m_max: '°F',
          temperature_2m_min: '°F',
          precipitation_probability_max: '%',
        },
        daily: {
          time: ['2026-04-18'],
          weather_code: [63],
          temperature_2m_max: [79.1],
          temperature_2m_min: [60.2],
          precipitation_probability_max: [40],
          sunrise: ['2026-04-18T06:21'],
          sunset: ['2026-04-18T20:32'],
        },
      }),
    } as Response);

    const { result } = renderHook(() => useWeather(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestUrl.searchParams.get('temperature_unit')).toBe('fahrenheit');
    expect(result.current.data?.units.temperature).toBe('°F');
    expect(result.current.data?.current?.condition.label).toBe('Rain: moderate');
  });

  it('persists unit and saved-city primitives without mutating unrelated store state', () => {
    useAppStore.setState({
      ...useAppStore.getState(),
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [],
      unit: 'celsius',
    });

    const { result: savedCitiesResult } = renderHook(() => useSavedCities());
    const { result: unitPreferenceResult } = renderHook(() => useUnitPreference());

    act(() => {
      unitPreferenceResult.current.setUnit('fahrenheit');
      savedCitiesResult.current.saveCurrentLocation();
      useAppStore.getState().saveLocation(berlin);
    });

    expect(useAppStore.getState().unit).toBe('fahrenheit');
    expect(useAppStore.getState().savedLocations.map((location) => location.id)).toEqual(['berlin', 'paris']);

    act(() => {
      savedCitiesResult.current.switchToSavedLocation('berlin');
    });

    expect(useAppStore.getState().currentLocation).toMatchObject({
      id: 'berlin',
      source: 'saved',
    });
  });
});
