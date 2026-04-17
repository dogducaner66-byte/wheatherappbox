import { afterEach, describe, expect, it, vi } from 'vitest';

import { fetchWeatherForecast, searchLocations } from '../../src/api/openmeteo';
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

describe('open-meteo api clients', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests normalized location matches from the geocoding API', async () => {
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

    await expect(searchLocations('Par')).resolves.toEqual([
      {
        id: '123',
        name: 'Paris',
        label: 'Paris, Ile-de-France, France',
        country: 'France',
        region: 'Ile-de-France',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        source: 'search',
      },
    ]);

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestUrl.toString()).toContain('geocoding-api.open-meteo.com');
    expect(requestUrl.searchParams.get('name')).toBe('Par');
    expect(requestUrl.searchParams.get('count')).toBe('5');
  });

  it('requests and normalizes a forecast using response units metadata', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 48.85,
        longitude: 2.35,
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

    const forecast = await fetchWeatherForecast(paris, 'fahrenheit');

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestUrl.toString()).toContain('api.open-meteo.com');
    expect(requestUrl.searchParams.get('temperature_unit')).toBe('fahrenheit');
    expect(requestUrl.searchParams.get('wind_speed_unit')).toBe('mph');
    expect(requestUrl.searchParams.get('precipitation_unit')).toBe('inch');
    expect(requestUrl.searchParams.get('timezone')).toBe('Europe/Paris');
    expect(forecast.units.temperature).toBe('°F');
    expect(forecast.current?.condition.label).toBe('Rain: moderate');
    expect(forecast.hourly[0]?.precipitationProbability).toBe(35);
    expect(forecast.daily[0]?.temperatureMax).toBe(79.1);
  });

  it('logs and rethrows forecast request failures', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    await expect(fetchWeatherForecast(paris, 'celsius')).rejects.toThrow('Forecast request failed with status 503');
    expect(consoleError).toHaveBeenCalledWith('Failed to fetch weather forecast.', expect.any(Error));
  });
});
