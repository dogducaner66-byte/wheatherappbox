import type { WeatherConditionKind, WeatherGradientKey } from '../api/types';

export interface GradientDescriptor {
  key: WeatherGradientKey;
  backgroundClassName: string;
  accentClassName: string;
}

const gradientCatalog: Record<WeatherGradientKey, GradientDescriptor> = {
  'clear-day': {
    key: 'clear-day',
    backgroundClassName: 'from-sky-400 via-cyan-500 to-blue-700',
    accentClassName: 'text-sky-100',
  },
  'clear-night': {
    key: 'clear-night',
    backgroundClassName: 'from-slate-950 via-blue-950 to-indigo-900',
    accentClassName: 'text-indigo-100',
  },
  'clouds-day': {
    key: 'clouds-day',
    backgroundClassName: 'from-slate-500 via-slate-700 to-slate-900',
    accentClassName: 'text-slate-100',
  },
  'clouds-night': {
    key: 'clouds-night',
    backgroundClassName: 'from-slate-800 via-slate-900 to-slate-950',
    accentClassName: 'text-slate-100',
  },
  fog: {
    key: 'fog',
    backgroundClassName: 'from-slate-400 via-slate-600 to-slate-800',
    accentClassName: 'text-slate-100',
  },
  'rain-day': {
    key: 'rain-day',
    backgroundClassName: 'from-cyan-700 via-sky-800 to-slate-950',
    accentClassName: 'text-cyan-100',
  },
  'rain-night': {
    key: 'rain-night',
    backgroundClassName: 'from-blue-950 via-slate-950 to-slate-950',
    accentClassName: 'text-blue-100',
  },
  snow: {
    key: 'snow',
    backgroundClassName: 'from-slate-200 via-sky-100 to-slate-400',
    accentClassName: 'text-slate-900',
  },
  storm: {
    key: 'storm',
    backgroundClassName: 'from-violet-900 via-slate-950 to-slate-950',
    accentClassName: 'text-violet-100',
  },
};

export const resolveGradientKey = (kind: WeatherConditionKind, isDay: boolean): WeatherGradientKey => {
  switch (kind) {
    case 'clear':
      return isDay ? 'clear-day' : 'clear-night';
    case 'partly-cloudy':
    case 'cloudy':
      return isDay ? 'clouds-day' : 'clouds-night';
    case 'fog':
      return 'fog';
    case 'drizzle':
    case 'rain':
      return isDay ? 'rain-day' : 'rain-night';
    case 'snow':
      return 'snow';
    case 'thunderstorm':
      return 'storm';
    case 'unknown':
    default:
      return isDay ? 'clouds-day' : 'clouds-night';
  }
};

export const getGradientDescriptor = (key: WeatherGradientKey): GradientDescriptor => {
  return gradientCatalog[key];
};
