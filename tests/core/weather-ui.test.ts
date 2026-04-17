import { createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';
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

const renderApp = () => {
  const wrapper = createWrapper();
  return render(createElement(wrapper, { children: createElement(App) }));
};

describe('weather UI integration', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedAppStore();
    vi.restoreAllMocks();
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    });
  });

  it('renders the premium forecast surface for a selected location', async () => {
    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [],
      unit: 'celsius',
    });

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        timezone: 'Europe/Paris',
        timezone_abbreviation: 'CEST',
        latitude: paris.latitude,
        longitude: paris.longitude,
        current_units: {
          temperature_2m: '°C',
          apparent_temperature: '°C',
          wind_speed_10m: 'km/h',
        },
        current: {
          time: '2026-04-18T12:00',
          interval: 900,
          temperature_2m: 22.4,
          apparent_temperature: 23.2,
          is_day: 1,
          weather_code: 1,
          wind_speed_10m: 14.2,
        },
        hourly_units: {
          temperature_2m: '°C',
          precipitation_probability: '%',
        },
        hourly: {
          time: ['2026-04-18T12:00', '2026-04-18T13:00', '2026-04-18T14:00'],
          temperature_2m: [22.4, 23.1, 23.7],
          precipitation_probability: [10, 12, 15],
          weather_code: [1, 2, 3],
        },
        daily_units: {
          temperature_2m_max: '°C',
          temperature_2m_min: '°C',
          precipitation_probability_max: '%',
        },
        daily: {
          time: ['2026-04-18', '2026-04-19', '2026-04-20'],
          weather_code: [1, 61, 3],
          temperature_2m_max: [25.4, 21.1, 19.4],
          temperature_2m_min: [16.2, 14.3, 13.1],
          precipitation_probability_max: [15, 48, 24],
          sunrise: ['2026-04-18T06:21', '2026-04-19T06:19', '2026-04-20T06:17'],
          sunset: ['2026-04-18T20:32', '2026-04-19T20:33', '2026-04-20T20:35'],
        },
      }),
    } as Response);

    renderApp();

    expect(await screen.findByRole('heading', { name: 'Paris' })).toBeInTheDocument();
    expect(screen.getByText(/now playing outside/i)).toBeInTheDocument();
    expect(screen.getByText(/hourly outlook/i)).toBeInTheDocument();
    expect(screen.getByText(/7-day forecast/i)).toBeInTheDocument();
    expect(screen.getByText(/details/i)).toBeInTheDocument();
  });

  it('shows the offline state instead of a generic error when the browser is disconnected', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [],
      unit: 'celsius',
    });

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    });

    vi.spyOn(global, 'fetch').mockRejectedValue(new Error('offline'));

    renderApp();

    expect(await screen.findByRole('heading', { name: /reconnect to refresh the live weather stream/i })).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith('Failed to fetch weather forecast.', expect.any(Error));
  });

  it('surfaces the permission guidance when location access is denied before a city is selected', async () => {
    useAppStore.setState({
      currentLocation: null,
      geolocationStatus: 'denied',
      savedLocations: [],
      unit: 'celsius',
    });

    renderApp();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /search for a city to unlock the live forecast/i })).toBeInTheDocument();
    });
    expect(screen.getByText(/weatherbox is staying private-first/i)).toBeInTheDocument();
  });
});
