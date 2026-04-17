import type { WeatherCondition, WeatherConditionKind } from '../api/types';
import { resolveGradientKey } from './gradients';

interface WeatherCodeDescriptor {
  label: string;
  kind: WeatherConditionKind;
}

const weatherCodeCatalog: Record<number, WeatherCodeDescriptor> = {
  0: { label: 'Clear sky', kind: 'clear' },
  1: { label: 'Mainly clear', kind: 'partly-cloudy' },
  2: { label: 'Partly cloudy', kind: 'partly-cloudy' },
  3: { label: 'Overcast', kind: 'cloudy' },
  45: { label: 'Fog', kind: 'fog' },
  48: { label: 'Depositing rime fog', kind: 'fog' },
  51: { label: 'Drizzle: light', kind: 'drizzle' },
  53: { label: 'Drizzle: moderate', kind: 'drizzle' },
  55: { label: 'Drizzle: dense', kind: 'drizzle' },
  56: { label: 'Freezing drizzle: light', kind: 'drizzle' },
  57: { label: 'Freezing drizzle: dense', kind: 'drizzle' },
  61: { label: 'Rain: slight', kind: 'rain' },
  63: { label: 'Rain: moderate', kind: 'rain' },
  65: { label: 'Rain: heavy', kind: 'rain' },
  66: { label: 'Freezing rain: light', kind: 'rain' },
  67: { label: 'Freezing rain: heavy', kind: 'rain' },
  71: { label: 'Snow fall: slight', kind: 'snow' },
  73: { label: 'Snow fall: moderate', kind: 'snow' },
  75: { label: 'Snow fall: heavy', kind: 'snow' },
  77: { label: 'Snow grains', kind: 'snow' },
  80: { label: 'Rain showers: slight', kind: 'rain' },
  81: { label: 'Rain showers: moderate', kind: 'rain' },
  82: { label: 'Rain showers: violent', kind: 'rain' },
  85: { label: 'Snow showers: slight', kind: 'snow' },
  86: { label: 'Snow showers: heavy', kind: 'snow' },
  95: { label: 'Thunderstorm', kind: 'thunderstorm' },
  96: { label: 'Thunderstorm with slight hail', kind: 'thunderstorm' },
  99: { label: 'Thunderstorm with heavy hail', kind: 'thunderstorm' },
};

const unknownDescriptor: WeatherCodeDescriptor = {
  label: 'Unknown conditions',
  kind: 'unknown',
};

export const getWeatherCodeMeta = (code: number | null | undefined, isDay: boolean): WeatherCondition => {
  const normalizedCode = typeof code === 'number' && Number.isFinite(code) ? code : -1;
  const descriptor = weatherCodeCatalog[normalizedCode] ?? unknownDescriptor;

  return {
    code: normalizedCode,
    label: descriptor.label,
    kind: descriptor.kind,
    gradient: resolveGradientKey(descriptor.kind, isDay),
  };
};
