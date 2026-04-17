import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { WeatherHero } from '../../src/components/WeatherHero';
import type { WeatherForecast } from '../../src/api/types';

const parisForecast: WeatherForecast = {
  location: {
    id: 'paris',
    name: 'Paris',
    label: 'Paris, Ile-de-France, France',
    latitude: 48.8566,
    longitude: 2.3522,
    source: 'search',
    timezone: 'Europe/Paris',
    timezoneAbbreviation: 'CEST',
  },
  requestedUnit: 'celsius',
  units: {
    temperature: '°C',
    apparentTemperature: '°C',
    windSpeed: 'km/h',
    precipitationProbability: '%',
  },
  current: {
    time: '2026-04-18T12:00',
    intervalMinutes: 60,
    isDay: true,
    temperature: 22,
    apparentTemperature: 24,
    windSpeed: 15,
    condition: {
      code: 1,
      label: 'Mainly clear',
      kind: 'partly-cloudy',
      gradient: 'clear-day',
    },
  },
  hourly: [
    {
      time: '2026-04-18T12:00',
      isDay: true,
      temperature: 22,
      precipitationProbability: 10,
      condition: {
        code: 1,
        label: 'Mainly clear',
        kind: 'partly-cloudy',
        gradient: 'clear-day',
      },
    },
  ],
  daily: [
    {
      date: '2026-04-18',
      temperatureMax: 25,
      temperatureMin: 16,
      precipitationProbabilityMax: 15,
      sunrise: '2026-04-18T06:21',
      sunset: '2026-04-18T20:32',
      condition: {
        code: 1,
        label: 'Mainly clear',
        kind: 'partly-cloudy',
        gradient: 'clear-day',
      },
    },
  ],
};

describe('WeatherHero', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the live weather overview for the selected city', () => {
    render(<WeatherHero canSaveLocation={true} forecast={parisForecast} isCurrentLocationSaved={false} onSaveLocation={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'Paris' })).toBeInTheDocument();
    expect(screen.getByText(/now playing outside/i)).toBeInTheDocument();
    expect(screen.getByText(/mainly clear/i)).toBeInTheDocument();
    expect(screen.getByText(/today/i)).toBeInTheDocument();
  });

  it('invokes the save action when the location is not already in the shortlist', async () => {
    const user = userEvent.setup();
    const onSaveLocation = vi.fn();

    render(<WeatherHero canSaveLocation={true} forecast={parisForecast} isCurrentLocationSaved={false} onSaveLocation={onSaveLocation} />);

    await user.click(screen.getByRole('button', { name: 'Save location' }));

    expect(onSaveLocation).toHaveBeenCalledTimes(1);
  });

  it('disables the save button once the active location is already stored', () => {
    render(<WeatherHero canSaveLocation={false} forecast={parisForecast} isCurrentLocationSaved={true} onSaveLocation={() => undefined} />);

    expect(screen.getByRole('button', { name: /saved to shortlist/i })).toBeDisabled();
  });
});
