import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import App from '../../src/App';
import { LocationSearch } from '../../src/components/LocationSearch';
import { SavedCities } from '../../src/components/SavedCities';
import { clearPersistedAppStore, useAppStore } from '../../src/store/appStore';
import type { LocationOption } from '../../src/types/location';

const renderWithProviders = (ui: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

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

describe('Location search integration', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedAppStore();
    vi.restoreAllMocks();
  });

  it('searches locations with combobox semantics and lets the app save the selected city', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 123,
            name: 'Paris',
            country: 'France',
            admin1: 'Ile-de-France',
            latitude: 48.8566,
            longitude: 2.3522,
            timezone: 'Europe/Paris',
          },
        ],
      }),
    } as Response);

    const user = userEvent.setup();

    renderWithProviders(<App />);

    const combobox = screen.getByRole('combobox', { name: /search for a city/i });
    await user.type(combobox, 'Par');

    const option = await screen.findByRole('option', { name: /paris/i });
    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(fetchMock).toHaveBeenCalledWith(expect.any(URL));

    await user.click(option);

    expect(screen.getByRole('heading', { name: 'Paris' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save location/i }));

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    expect(screen.getByRole('button', { name: /remove paris/i })).toBeInTheDocument();

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestUrl.toString()).toContain('geocoding-api.open-meteo.com');
    expect(requestUrl.searchParams.get('name')).toBe('Par');
  });

  it('falls back to the search box when geolocation is denied', async () => {
    const deniedPositionError = {
      code: 1,
      message: 'Permission denied',
    } as GeolocationPositionError;
    const getCurrentPosition = vi.fn(
      (
        _success: PositionCallback,
        error: PositionErrorCallback | null | undefined,
      ) => {
        error?.(deniedPositionError);
      },
    );

    Object.defineProperty(window.navigator, 'geolocation', {
      configurable: true,
      value: {
        getCurrentPosition,
      },
    });

    const user = userEvent.setup();

    renderWithProviders(<LocationSearch debounceMs={0} />);

    const combobox = screen.getByRole('combobox', { name: /search for a city/i });

    await user.click(screen.getByRole('button', { name: /use my location/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/location access was denied/i);
    await waitFor(() => {
      expect(combobox).toHaveFocus();
    });
  });

  it('switches to saved cities and deterministically falls forward when the active city is removed', async () => {
    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [paris, berlin],
      unit: 'celsius',
    });

    const user = userEvent.setup();

    renderWithProviders(<SavedCities />);

    await user.click(screen.getByRole('button', { name: /switch to berlin/i }));
    expect(useAppStore.getState().currentLocation?.id).toBe('berlin');

    await user.click(screen.getByRole('button', { name: /remove berlin/i }));

    expect(useAppStore.getState().currentLocation?.id).toBe('paris');
    expect(useAppStore.getState().savedLocations.map((location) => location.id)).toEqual(['paris']);
  });
});
