import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '../../src/App';
import { clearPersistedAppStore, useAppStore } from '../../src/store/appStore';
import type { LocationOption } from '../../src/types/location';

const renderApp = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  );
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

describe('app hero shell', () => {
  beforeEach(() => {
    localStorage.clear();
    clearPersistedAppStore();
  });

  it('renders the empty active-location state with save disabled', () => {
    renderApp();

    expect(screen.getByRole('heading', { name: /search or use geolocation to start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save location' })).toBeDisabled();
    expect(screen.getByText(/your current selection is stored locally/i)).toBeInTheDocument();
  });

  it('shows the current location details and saves them from the hero action', async () => {
    useAppStore.setState({
      currentLocation: paris,
      geolocationStatus: 'idle',
      savedLocations: [],
      unit: 'celsius',
    });

    const user = userEvent.setup();

    renderApp();

    expect(screen.getByRole('heading', { name: 'Paris' })).toBeInTheDocument();
    expect(screen.getByText(/48\.86, 2\.35/i)).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Save location' }));

    expect(screen.getByRole('button', { name: 'Saved' })).toBeDisabled();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('switches units and updates the integration summary cards', async () => {
    useAppStore.setState({
      currentLocation: {
        ...paris,
        source: 'saved',
      },
      geolocationStatus: 'granted',
      savedLocations: [paris],
      unit: 'celsius',
    });

    const user = userEvent.setup();

    renderApp();

    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('saved')).toBeInTheDocument();
    expect(screen.getByText(/metric forecast cards will render by default/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Imperial' }));

    expect(useAppStore.getState().unit).toBe('fahrenheit');
    expect(screen.getByText('F')).toBeInTheDocument();
    expect(screen.getByText(/imperial forecast cards will render by default/i)).toBeInTheDocument();
  });
});
