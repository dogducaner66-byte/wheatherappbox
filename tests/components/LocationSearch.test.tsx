import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('searches locations with combobox semantics and selects the active city', async () => {
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

    renderWithProviders(<LocationSearch debounceMs={0} />);

    const combobox = screen.getByRole('combobox', { name: /search for a city/i });
    await user.type(combobox, 'Par');

    const listbox = await screen.findByRole('listbox', { name: /location suggestions/i });
    const option = await screen.findByRole('option', { name: /paris/i });

    expect(combobox).toHaveAttribute('aria-expanded', 'true');
    expect(combobox).toHaveAttribute('aria-controls', listbox.id);
    expect(fetchMock).toHaveBeenCalledWith(expect.any(URL), expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(option).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{ArrowDown}');

    const activeOptionId = combobox.getAttribute('aria-activedescendant');
    expect(activeOptionId).toBeTruthy();
    expect(option.id).toBe(activeOptionId);
    expect(option).toHaveAttribute('aria-selected', 'true');

    await user.keyboard('{Enter}');

    expect(useAppStore.getState().currentLocation).toMatchObject({
      id: '123',
      name: 'Paris',
      timezone: 'Europe/Paris',
    });
    expect(combobox).toHaveValue('Paris, Ile-de-France, France');
    await waitFor(() => {
      expect(screen.queryByRole('listbox', { name: /location suggestions/i })).not.toBeInTheDocument();
    });

    const searchQueries = fetchMock.mock.calls
      .map(([request]) => (request as URL).searchParams.get('name'))
      .filter((value): value is string => Boolean(value));

    expect(searchQueries).toContain('Par');
  });

  it('falls back to the search box when geolocation is denied', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
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
    expect(consoleError).toHaveBeenCalledWith('Failed to access geolocation.', deniedPositionError);
  });

  it('clears the geolocation fallback error after switching to a saved city', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
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

    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [paris, berlin],
      unit: 'celsius',
    });

    const user = userEvent.setup();

    renderWithProviders(<LocationSearch debounceMs={0} />);

    await user.click(screen.getByRole('button', { name: /use my location/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/location access was denied/i);

    act(() => {
      useAppStore.setState({
        currentLocation: berlin,
      });
    });

    await waitFor(() => {
      expect(screen.queryByText(/location access was denied/i)).not.toBeInTheDocument();
    });
    expect(consoleError).toHaveBeenCalledWith('Failed to access geolocation.', deniedPositionError);
  });

  it('surfaces a search error when location matches cannot be loaded', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const user = userEvent.setup();

    renderWithProviders(<LocationSearch debounceMs={0} />);

    await user.type(screen.getByRole('combobox', { name: /search for a city/i }), 'Par');

    expect(await screen.findByRole('alert')).toHaveTextContent(/could not load location matches/i);
    expect(consoleError).toHaveBeenCalledWith('Failed to fetch geocoding results.', expect.any(Error));
  });

  it('announces when no matching cities are found and closes the listbox on escape', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [],
      }),
    } as Response);

    const user = userEvent.setup();

    renderWithProviders(<LocationSearch debounceMs={0} />);

    const combobox = screen.getByRole('combobox', { name: /search for a city/i });

    await user.type(combobox, 'Os');

    expect(await screen.findByText(/no matching cities found/i)).toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByRole('listbox', { name: /location suggestions/i })).not.toBeInTheDocument();
    });
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
    expect(combobox).not.toHaveAttribute('aria-activedescendant');
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
