import { describe, expect, it } from 'vitest';

import type { OpenMeteoForecastResponse } from '../../src/api/types';
import { getGradientDescriptor } from '../../src/utils/gradients';
import {
  formatDayLabel,
  formatHourLabel,
  formatPrecipitationProbability,
  formatTemperature,
  formatTemperatureRange,
  formatWindSpeed,
  normalizeWeatherForecast,
} from '../../src/utils/formatters';
import { getWeatherCodeMeta } from '../../src/utils/weatherCodes';
import type { LocationOption } from '../../src/types/location';

const reykjavik: LocationOption = {
  id: 'reykjavik',
  name: 'Reykjavik',
  label: 'Reykjavik, Iceland',
  country: 'Iceland',
  latitude: 64.1466,
  longitude: -21.9426,
  timezone: 'Atlantic/Reykjavik',
  source: 'search',
};

describe('weather domain types and helpers', () => {
  it('maps optional forecast payload fields without assuming missing arrays are present', () => {
    const payload: OpenMeteoForecastResponse = {
      timezone: 'Atlantic/Reykjavik',
      current_units: {
        temperature_2m: '°C',
        apparent_temperature: '°C',
        wind_speed_10m: 'km/h',
      },
      current: {
        time: '2026-04-18T09:00',
        temperature_2m: 3.4,
        apparent_temperature: 1.9,
        is_day: 1,
        weather_code: 3,
      },
      hourly_units: {
        temperature_2m: '°C',
        precipitation_probability: '%',
      },
      hourly: {
        time: ['2026-04-18T09:00', '2026-04-18T10:00'],
        temperature_2m: [3.4],
        weather_code: [3, 45],
      },
      daily_units: {
        temperature_2m_max: '°C',
        temperature_2m_min: '°C',
        precipitation_probability_max: '%',
      },
      daily: {
        time: ['2026-04-18'],
        weather_code: [45],
        temperature_2m_min: [-1.2],
      },
    };

    const forecast = normalizeWeatherForecast(reykjavik, payload, 'celsius');

    expect(forecast.units.temperature).toBe('°C');
    expect(forecast.current?.condition.label).toBe('Overcast');
    expect(forecast.hourly).toEqual([
      expect.objectContaining({
        time: '2026-04-18T09:00',
        temperature: 3.4,
        precipitationProbability: undefined,
      }),
      expect.objectContaining({
        time: '2026-04-18T10:00',
        temperature: undefined,
        condition: expect.objectContaining({
          label: 'Fog',
        }),
      }),
    ]);
    expect(forecast.daily).toEqual([
      expect.objectContaining({
        date: '2026-04-18',
        temperatureMax: undefined,
        temperatureMin: -1.2,
        precipitationProbabilityMax: undefined,
      }),
    ]);
  });

  it('resolves WMO condition metadata and gradient taxonomy deterministically', () => {
    const nightStorm = getWeatherCodeMeta(95, false);

    expect(nightStorm).toEqual({
      code: 95,
      label: 'Thunderstorm',
      kind: 'thunderstorm',
      gradient: 'storm',
    });
    expect(getGradientDescriptor(nightStorm.gradient)).toMatchObject({
      backgroundClassName: expect.stringContaining('violet'),
    });
  });

  it('formats weather values with unit metadata from the normalized response', () => {
    expect(formatTemperature(18.6, '°C')).toBe('19°C');
    expect(formatTemperatureRange(12.2, 18.6, '°C')).toBe('19°C / 12°C');
    expect(formatWindSpeed(23.4, 'km/h')).toBe('23 km/h');
    expect(formatPrecipitationProbability(41.2, '%')).toBe('41%');
    expect(formatHourLabel('2026-04-18T18:00:00Z', 'UTC')).toBe('6 PM');
    expect(formatDayLabel('2026-04-18', 'UTC')).toBe('Sat, Apr 18');
  });
});
