import { motion } from 'framer-motion';

import type { DailyForecastEntry } from '../api/types';
import { formatDayLabel, formatPrecipitationProbability, formatTemperatureRange } from '../utils/formatters';
import { WeatherIcon } from './WeatherIcon';

interface DailyForecastProps {
  entries: DailyForecastEntry[];
  precipitationUnit: string;
  temperatureUnit: string;
  timeZone?: string;
}

export const DailyForecast = ({ entries, precipitationUnit, temperatureUnit, timeZone = 'UTC' }: DailyForecastProps) => {
  const visibleEntries = entries.slice(0, 7);

  if (visibleEntries.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">7-day forecast</h2>
          <p className="text-sm text-slate-300">Daily highs, lows, and precipitation pressure for the week ahead.</p>
        </div>
      </div>

      <div className="space-y-3">
        {visibleEntries.map((entry, index) => (
          <motion.article
            animate={{ opacity: 1, x: 0 }}
            className="grid items-center gap-3 rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4 sm:grid-cols-[1.4fr,auto,1fr,auto]"
            initial={{ opacity: 0, x: 12 }}
            key={`${entry.date}-${index}`}
            transition={{ delay: index * 0.03, duration: 0.24 }}
          >
            <div>
              <p className="font-semibold text-white">{formatDayLabel(entry.date, timeZone)}</p>
              <p className="text-sm text-slate-300">{entry.condition.label}</p>
            </div>
            <div className="text-sky-100">
              <WeatherIcon className="h-10 w-10" condition={entry.condition} isDay={true} />
            </div>
            <p className="text-sm font-medium text-slate-100">
              {formatTemperatureRange(entry.temperatureMin, entry.temperatureMax, temperatureUnit)}
            </p>
            <p className="text-sm text-slate-300">
              {formatPrecipitationProbability(entry.precipitationProbabilityMax, precipitationUnit)}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
};
