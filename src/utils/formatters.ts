import type {
  DailyForecastEntry,
  HourlyForecastEntry,
  OpenMeteoForecastResponse,
  OpenMeteoGeocodingResult,
  WeatherForecast,
  WeatherUnits,
} from '../api/types';
import type { LocationOption, TemperatureUnit } from '../types/location';
import { getWeatherCodeMeta } from './weatherCodes';

const toTrimmedString = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const toFiniteNumber = (value: number | undefined): number | undefined => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
};

const toDateValue = (value: string): Date => {
  return new Date(value.includes('T') ? value : `${value}T12:00:00Z`);
};

const getDaylightFromClock = (value: string, timeZone: string): boolean => {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: false,
    timeZone,
  });
  const hourPart = dateFormatter.formatToParts(toDateValue(value)).find((part) => part.type === 'hour')?.value;
  const hour = Number(hourPart);

  if (Number.isNaN(hour)) {
    return true;
  }

  return hour >= 6 && hour < 18;
};

const getRequestedUnitDefaults = (requestedUnit: TemperatureUnit) => {
  return requestedUnit === 'fahrenheit'
    ? {
        temperature: '°F',
        windSpeed: 'mph',
        precipitationProbability: '%',
      }
    : {
        temperature: '°C',
        windSpeed: 'km/h',
        precipitationProbability: '%',
      };
};

const getForecastUnits = (payload: OpenMeteoForecastResponse, requestedUnit: TemperatureUnit): WeatherUnits => {
  const defaults = getRequestedUnitDefaults(requestedUnit);

  return {
    temperature:
      payload.current_units?.temperature_2m ??
      payload.hourly_units?.temperature_2m ??
      payload.daily_units?.temperature_2m_max ??
      defaults.temperature,
    apparentTemperature: payload.current_units?.apparent_temperature ?? defaults.temperature,
    windSpeed: payload.current_units?.wind_speed_10m ?? defaults.windSpeed,
    precipitationProbability:
      payload.hourly_units?.precipitation_probability ??
      payload.daily_units?.precipitation_probability_max ??
      defaults.precipitationProbability,
  };
};

const mapHourlyEntries = (payload: OpenMeteoForecastResponse, timeZone: string): HourlyForecastEntry[] => {
  const hourlyTimes = payload.hourly?.time ?? [];

  return hourlyTimes.map((time, index) => {
    const isDay = getDaylightFromClock(time, timeZone);

    return {
      time,
      isDay,
      temperature: toFiniteNumber(payload.hourly?.temperature_2m?.[index]),
      precipitationProbability: toFiniteNumber(payload.hourly?.precipitation_probability?.[index]),
      condition: getWeatherCodeMeta(payload.hourly?.weather_code?.[index], isDay),
    };
  });
};

const mapDailyEntries = (payload: OpenMeteoForecastResponse): DailyForecastEntry[] => {
  const dailyDates = payload.daily?.time ?? [];

  return dailyDates.map((date, index) => ({
    date,
    sunrise: toTrimmedString(payload.daily?.sunrise?.[index]),
    sunset: toTrimmedString(payload.daily?.sunset?.[index]),
    temperatureMax: toFiniteNumber(payload.daily?.temperature_2m_max?.[index]),
    temperatureMin: toFiniteNumber(payload.daily?.temperature_2m_min?.[index]),
    precipitationProbabilityMax: toFiniteNumber(payload.daily?.precipitation_probability_max?.[index]),
    condition: getWeatherCodeMeta(payload.daily?.weather_code?.[index], true),
  }));
};

export const formatLocationLabel = (result: Pick<OpenMeteoGeocodingResult, 'name' | 'admin1' | 'country'>): string => {
  return [toTrimmedString(result.name), toTrimmedString(result.admin1), toTrimmedString(result.country)].filter(Boolean).join(', ');
};

export const normalizeLocationSearchResults = (results: OpenMeteoGeocodingResult[]): LocationOption[] => {
  return results.flatMap((result) => {
    const name = toTrimmedString(result.name);
    const latitude = toFiniteNumber(result.latitude);
    const longitude = toFiniteNumber(result.longitude);

    if (!name || latitude === undefined || longitude === undefined) {
      return [];
    }

    return [
      {
        id: String(result.id ?? `${name}-${latitude}-${longitude}`),
        name,
        label: formatLocationLabel(result) || name,
        country: toTrimmedString(result.country),
        region: toTrimmedString(result.admin1),
        latitude,
        longitude,
        timezone: toTrimmedString(result.timezone),
        source: 'search',
      },
    ];
  });
};

export const normalizeWeatherForecast = (
  location: LocationOption,
  payload: OpenMeteoForecastResponse,
  requestedUnit: TemperatureUnit,
): WeatherForecast => {
  const timeZone = payload.timezone ?? location.timezone ?? 'UTC';
  const isCurrentDaytime = payload.current?.is_day === 0 ? false : true;

  return {
    location: {
      id: location.id,
      name: location.name,
      label: location.label,
      latitude: payload.latitude ?? location.latitude,
      longitude: payload.longitude ?? location.longitude,
      elevation: toFiniteNumber(payload.elevation),
      timezone: payload.timezone ?? location.timezone,
      timezoneAbbreviation: toTrimmedString(payload.timezone_abbreviation),
      source: location.source,
    },
    requestedUnit,
    units: getForecastUnits(payload, requestedUnit),
    current: payload.current?.time
      ? {
          time: payload.current.time,
          intervalMinutes: toFiniteNumber(payload.current.interval),
          isDay: isCurrentDaytime,
          temperature: toFiniteNumber(payload.current.temperature_2m),
          apparentTemperature: toFiniteNumber(payload.current.apparent_temperature),
          windSpeed: toFiniteNumber(payload.current.wind_speed_10m),
          condition: getWeatherCodeMeta(payload.current.weather_code, isCurrentDaytime),
        }
      : null,
    hourly: mapHourlyEntries(payload, timeZone),
    daily: mapDailyEntries(payload),
  };
};

export const formatTemperature = (value: number | undefined, unit: string): string => {
  return value === undefined ? '--' : `${Math.round(value)}${unit}`;
};

export const formatTemperatureRange = (minimum: number | undefined, maximum: number | undefined, unit: string): string => {
  if (minimum === undefined && maximum === undefined) {
    return '--';
  }

  if (minimum === undefined) {
    return formatTemperature(maximum, unit);
  }

  if (maximum === undefined) {
    return formatTemperature(minimum, unit);
  }

  return `${formatTemperature(maximum, unit)} / ${formatTemperature(minimum, unit)}`;
};

export const formatWindSpeed = (value: number | undefined, unit: string): string => {
  return value === undefined ? '--' : `${Math.round(value)} ${unit}`;
};

export const formatPrecipitationProbability = (value: number | undefined, unit: string): string => {
  return value === undefined ? '--' : `${Math.round(value)}${unit}`;
};

export const formatHourLabel = (value: string, timeZone = 'UTC'): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    timeZone,
  }).format(toDateValue(value));
};

export const formatDayLabel = (value: string, timeZone = 'UTC'): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(toDateValue(value));
};
