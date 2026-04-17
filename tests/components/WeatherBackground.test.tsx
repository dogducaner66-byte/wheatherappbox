import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WeatherBackground } from '../../src/components/WeatherBackground';
import type { WeatherForecast } from '../../src/api/types';

const clearForecast: WeatherForecast = {
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
    temperature: 21,
    apparentTemperature: 22,
    windSpeed: 12,
    condition: {
      code: 0,
      label: 'Clear sky',
      kind: 'clear',
      gradient: 'clear-day',
    },
  },
  hourly: [],
  daily: [],
};

describe('WeatherBackground', () => {
  it('uses the forecast gradient and scene for live conditions', () => {
    render(<WeatherBackground forecast={clearForecast} />);

    const background = screen.getByTestId('weather-background');
    expect(background).toHaveAttribute('data-gradient', 'clear-day');
    expect(background).toHaveAttribute('data-scene', 'clear');
  });

  it('falls back to the neutral night scene when no forecast is available', () => {
    render(<WeatherBackground forecast={null} />);

    const background = screen.getByTestId('weather-background');
    expect(background).toHaveAttribute('data-gradient', 'clouds-night');
    expect(background).toHaveAttribute('data-scene', 'ambient');
  });
});
