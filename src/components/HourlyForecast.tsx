import { motion } from 'framer-motion';

import type { HourlyForecastEntry } from '../api/types';
import { formatHourLabel, formatPrecipitationProbability, formatTemperature } from '../utils/formatters';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastProps {
  entries: HourlyForecastEntry[];
  precipitationUnit: string;
  temperatureUnit: string;
  timeZone?: string;
}

export const HourlyForecast = ({ entries, precipitationUnit, temperatureUnit, timeZone = 'UTC' }: HourlyForecastProps) => {
  const visibleEntries = entries.slice(0, 10);

  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Hourly outlook</h2>
          <p className="text-sm text-slate-300">The next ten checkpoints, tuned for at-a-glance scanning.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">10 hours</div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1">
        {visibleEntries.map((entry, index) => (
          <motion.article
            animate={{ opacity: 1, y: 0 }}
            className="min-w-[8.25rem] rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-4"
            initial={{ opacity: 0, y: 10 }}
            key={`${entry.time}-${index}`}
            transition={{ delay: index * 0.03, duration: 0.25 }}
          >
            <p className="text-sm font-medium text-slate-100">{formatHourLabel(entry.time, timeZone)}</p>
            <div className="my-4 text-sky-100">
              <WeatherIcon className="h-11 w-11" condition={entry.condition} isDay={entry.isDay} />
            </div>
            <p className="text-xl font-semibold">{formatTemperature(entry.temperature, temperatureUnit)}</p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
              {formatPrecipitationProbability(entry.precipitationProbability, precipitationUnit)} precip
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
