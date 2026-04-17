import type { OpenMeteoForecastResponse, WeatherForecast, WeatherRequestOptions } from './types';
import type { LocationOption, TemperatureUnit } from '../types/location';
import { normalizeWeatherForecast } from '../utils/formatters';

const OPEN_METEO_FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

const CURRENT_FIELDS = ['temperature_2m', 'apparent_temperature', 'is_day', 'weather_code', 'wind_speed_10m'] as const;
const HOURLY_FIELDS = ['temperature_2m', 'precipitation_probability', 'weather_code'] as const;
const DAILY_FIELDS = ['weather_code', 'temperature_2m_max', 'temperature_2m_min', 'precipitation_probability_max', 'sunrise', 'sunset'] as const;

const getForecastRequestUnits = (unit: TemperatureUnit) => {
  return unit === 'fahrenheit'
    ? {
        temperature: 'fahrenheit',
        windSpeed: 'mph',
        precipitation: 'inch',
      }
    : {
        temperature: 'celsius',
        windSpeed: 'kmh',
        precipitation: 'mm',
      };
};

const buildForecastRequestUrl = (location: LocationOption, unit: TemperatureUnit): URL => {
  const requestUnits = getForecastRequestUnits(unit);
  const requestUrl = new URL(OPEN_METEO_FORECAST_ENDPOINT);

  requestUrl.searchParams.set('latitude', String(location.latitude));
  requestUrl.searchParams.set('longitude', String(location.longitude));
  requestUrl.searchParams.set('current', CURRENT_FIELDS.join(','));
  requestUrl.searchParams.set('hourly', HOURLY_FIELDS.join(','));
  requestUrl.searchParams.set('daily', DAILY_FIELDS.join(','));
  requestUrl.searchParams.set('forecast_days', '7');
  requestUrl.searchParams.set('temperature_unit', requestUnits.temperature);
  requestUrl.searchParams.set('wind_speed_unit', requestUnits.windSpeed);
  requestUrl.searchParams.set('precipitation_unit', requestUnits.precipitation);
  requestUrl.searchParams.set('timezone', location.timezone ?? 'auto');

  return requestUrl;
};

export const fetchWeatherForecast = async (
  location: LocationOption,
  unit: TemperatureUnit,
  options: WeatherRequestOptions = {},
): Promise<WeatherForecast> => {
  try {
    const requestUrl = buildForecastRequestUrl(location, unit);
    const response = await fetch(requestUrl, {
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`Forecast request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenMeteoForecastResponse;
    return normalizeWeatherForecast(location, payload, unit);
  } catch (error) {
    console.error('Failed to fetch weather forecast.', error);
    throw error;
  }
};

export { searchLocations } from './geocoding';
