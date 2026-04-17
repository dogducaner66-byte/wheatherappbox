import { CloudSun, Droplets, Gauge, MapPinned, Sunrise, Sunset, Wind } from 'lucide-react';

import type { WeatherForecast } from '../api/types';
import { formatPrecipitationProbability, formatTemperature, formatWindSpeed } from '../utils/formatters';

interface WeatherDetailsProps {
  forecast: WeatherForecast;
}

const formatClockLabel = (value: string | undefined, timeZone: string): string => {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone,
  }).format(new Date(value));
};

const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`;
};

export const WeatherDetails = ({ forecast }: WeatherDetailsProps) => {
  const current = forecast.current;
  const today = forecast.daily[0];
  const timeZone = forecast.location.timezone ?? 'UTC';

  const details = [
    {
      icon: Gauge,
      label: 'Feels like',
      value: current ? formatTemperature(current.apparentTemperature, forecast.units.apparentTemperature) : '--',
    },
    {
      icon: Wind,
      label: 'Wind',
      value: current ? formatWindSpeed(current.windSpeed, forecast.units.windSpeed) : '--',
    },
    {
      icon: Droplets,
      label: 'Precipitation',
      value: formatPrecipitationProbability(
        forecast.hourly[0]?.precipitationProbability ?? today?.precipitationProbabilityMax,
        forecast.units.precipitationProbability,
      ),
    },
    {
      icon: Sunrise,
      label: 'Sunrise',
      value: formatClockLabel(today?.sunrise, timeZone),
    },
    {
      icon: Sunset,
      label: 'Sunset',
      value: formatClockLabel(today?.sunset, timeZone),
    },
    {
      icon: CloudSun,
      label: 'Timezone',
      value: forecast.location.timezoneAbbreviation ?? forecast.location.timezone ?? 'UTC',
    },
    {
      icon: MapPinned,
      label: 'Coordinates',
      value: formatCoordinates(forecast.location.latitude, forecast.location.longitude),
    },
    {
      icon: Gauge,
      label: 'Elevation',
      value: forecast.location.elevation === undefined ? '--' : `${Math.round(forecast.location.elevation)} m`,
    },
  ];

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Details</h2>
        <p className="text-sm text-slate-300">A denser readout for people who live in the numbers.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {details.map((detail) => {
          const Icon = detail.icon;

          return (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4" key={detail.label}>
              <div className="flex items-center gap-2 text-slate-300">
                <Icon className="h-4 w-4" />
                <p className="text-xs uppercase tracking-[0.2em]">{detail.label}</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-white">{detail.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
