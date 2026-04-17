import type { LocationOption, TemperatureUnit } from '../types/location';

export type WeatherConditionKind =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown';

export type WeatherGradientKey =
  | 'clear-day'
  | 'clear-night'
  | 'clouds-day'
  | 'clouds-night'
  | 'fog'
  | 'rain-day'
  | 'rain-night'
  | 'snow'
  | 'storm';

export interface OpenMeteoGeocodingResult {
  id?: number;
  name?: string;
  country?: string;
  admin1?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface OpenMeteoGeocodingResponse {
  results?: OpenMeteoGeocodingResult[];
}

export interface OpenMeteoCurrentUnits {
  time?: string;
  interval?: string;
  temperature_2m?: string;
  apparent_temperature?: string;
  is_day?: string;
  weather_code?: string;
  wind_speed_10m?: string;
}

export interface OpenMeteoCurrentWeather {
  time?: string;
  interval?: number;
  temperature_2m?: number;
  apparent_temperature?: number;
  is_day?: number;
  weather_code?: number;
  wind_speed_10m?: number;
}

export interface OpenMeteoHourlyUnits {
  time?: string;
  temperature_2m?: string;
  precipitation_probability?: string;
  weather_code?: string;
}

export interface OpenMeteoHourlyWeather {
  time?: string[];
  temperature_2m?: number[];
  precipitation_probability?: number[];
  weather_code?: number[];
}

export interface OpenMeteoDailyUnits {
  time?: string;
  sunrise?: string;
  sunset?: string;
  weather_code?: string;
  temperature_2m_max?: string;
  temperature_2m_min?: string;
  precipitation_probability_max?: string;
}

export interface OpenMeteoDailyWeather {
  time?: string[];
  sunrise?: string[];
  sunset?: string[];
  weather_code?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  precipitation_probability_max?: number[];
}

export interface OpenMeteoForecastResponse {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  timezone_abbreviation?: string;
  elevation?: number;
  current_units?: OpenMeteoCurrentUnits;
  current?: OpenMeteoCurrentWeather;
  hourly_units?: OpenMeteoHourlyUnits;
  hourly?: OpenMeteoHourlyWeather;
  daily_units?: OpenMeteoDailyUnits;
  daily?: OpenMeteoDailyWeather;
}

export interface WeatherUnits {
  temperature: string;
  apparentTemperature: string;
  windSpeed: string;
  precipitationProbability: string;
}

export interface WeatherCondition {
  code: number;
  label: string;
  kind: WeatherConditionKind;
  gradient: WeatherGradientKey;
}

export interface WeatherForecastLocation extends Pick<LocationOption, 'id' | 'name' | 'label' | 'latitude' | 'longitude' | 'source'> {
  elevation?: number;
  timezone?: string;
  timezoneAbbreviation?: string;
}

export interface CurrentWeatherSnapshot {
  time: string;
  intervalMinutes?: number;
  isDay: boolean;
  temperature?: number;
  apparentTemperature?: number;
  windSpeed?: number;
  condition: WeatherCondition;
}

export interface HourlyForecastEntry {
  time: string;
  isDay: boolean;
  temperature?: number;
  precipitationProbability?: number;
  condition: WeatherCondition;
}

export interface DailyForecastEntry {
  date: string;
  temperatureMax?: number;
  temperatureMin?: number;
  precipitationProbabilityMax?: number;
  sunrise?: string;
  sunset?: string;
  condition: WeatherCondition;
}

export interface WeatherForecast {
  location: WeatherForecastLocation;
  requestedUnit: TemperatureUnit;
  units: WeatherUnits;
  current: CurrentWeatherSnapshot | null;
  hourly: HourlyForecastEntry[];
  daily: DailyForecastEntry[];
}

export interface WeatherRequestOptions {
  signal?: AbortSignal;
}
