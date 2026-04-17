import { motion } from 'framer-motion';
import { Clock3, MapPinned, Sparkles } from 'lucide-react';

import type { WeatherForecast } from '../api/types';
import {
  formatDayLabel,
  formatPrecipitationProbability,
  formatTemperature,
  formatTemperatureRange,
  formatWindSpeed,
} from '../utils/formatters';
import { getGradientDescriptor } from '../utils/gradients';
import { WeatherIcon } from './WeatherIcon';

interface WeatherHeroProps {
  canSaveLocation: boolean;
  forecast: WeatherForecast;
  isCurrentLocationSaved: boolean;
  onSaveLocation: () => void;
}

const formatLocalDateTime = (value: string, timeZone: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    month: 'long',
    timeZone,
  }).format(new Date(value));
};

export const WeatherHero = ({
  canSaveLocation,
  forecast,
  isCurrentLocationSaved,
  onSaveLocation,
}: WeatherHeroProps) => {
  const current = forecast.current;
  const today = forecast.daily[0];
  const timeZone = forecast.location.timezone ?? 'UTC';
  const gradient = current ? getGradientDescriptor(current.condition.gradient) : null;

  if (!current) {
    return null;
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2.25rem] border border-white/15 bg-white/10 p-6 shadow-glow backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient?.backgroundClassName ?? 'from-slate-900 via-slate-950 to-slate-950'} opacity-35`} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.14),_transparent_34%)]" />
      </div>

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-100/90">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <MapPinned className="h-4 w-4" />
              {forecast.location.label}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <Clock3 className="h-4 w-4" />
              {formatLocalDateTime(current.time, timeZone)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5">
              <Sparkles className="h-4 w-4" />
              {current.isDay ? 'Daylight outlook' : 'Night conditions'}
            </span>
          </div>

          <div className="space-y-3">
            <p className={`text-sm uppercase tracking-[0.35em] ${gradient?.accentClassName ?? 'text-slate-100'}`}>Now playing outside</p>
            <div className="flex flex-wrap items-end gap-4">
              <h1 className="text-5xl font-semibold leading-none sm:text-7xl">{forecast.location.name}</h1>
              <p className="pb-1 text-lg text-slate-100/85">{current.condition.label}</p>
            </div>
            <p className="max-w-2xl text-sm text-slate-200/85 sm:text-base">
              {today
                ? `${formatDayLabel(today.date, timeZone)} keeps a ${formatTemperatureRange(
                    today.temperatureMin,
                    today.temperatureMax,
                    forecast.units.temperature,
                  )} range with precipitation peaking near ${formatPrecipitationProbability(
                    today.precipitationProbabilityMax,
                    forecast.units.precipitationProbability,
                  )}.`
                : 'Live conditions are ready with normalized provider data and adaptive weather styling.'}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-5">
            <div className="text-7xl font-semibold leading-none sm:text-[5.5rem]">
              {formatTemperature(current.temperature, forecast.units.temperature)}
            </div>
            <div className="space-y-2 pb-2 text-sm text-slate-200/85">
              <p>Feels like {formatTemperature(current.apparentTemperature, forecast.units.apparentTemperature)}</p>
              <p>Wind {formatWindSpeed(current.windSpeed, forecast.units.windSpeed)}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">Today</p>
              <p className="mt-3 text-xl font-semibold">
                {today ? formatTemperatureRange(today.temperatureMin, today.temperatureMax, forecast.units.temperature) : '--'}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">Rain chance</p>
              <p className="mt-3 text-xl font-semibold">
                {formatPrecipitationProbability(
                  forecast.hourly[0]?.precipitationProbability ?? today?.precipitationProbabilityMax,
                  forecast.units.precipitationProbability,
                )}
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-white/15 bg-slate-950/25 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300/80">Timezone</p>
              <p className="mt-3 text-xl font-semibold">{forecast.location.timezoneAbbreviation ?? forecast.location.timezone ?? 'UTC'}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-4 self-stretch lg:items-end">
          <div className="rounded-[2rem] border border-white/20 bg-slate-950/20 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
            <WeatherIcon className="h-28 w-28 sm:h-32 sm:w-32" condition={current.condition} isDay={current.isDay} />
          </div>
          <button
            className="rounded-full border border-sky-200/35 bg-white/10 px-4 py-2 text-sm font-semibold text-sky-50 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!canSaveLocation || isCurrentLocationSaved}
            type="button"
            onClick={onSaveLocation}
          >
            {isCurrentLocationSaved ? 'Saved to shortlist' : 'Save location'}
          </button>
        </div>
      </div>
    </motion.section>
  );
};
