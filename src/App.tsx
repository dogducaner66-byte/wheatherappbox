import { AnimatePresence, motion } from 'framer-motion';
import { Compass, Radar, ThermometerSun } from 'lucide-react';
import { useEffect, useState } from 'react';

import { DailyForecast } from './components/DailyForecast';
import { HourlyForecast } from './components/HourlyForecast';
import { LocationSearch } from './components/LocationSearch';
import { SavedCities } from './components/SavedCities';
import { WeatherBackground } from './components/WeatherBackground';
import { WeatherDetails } from './components/WeatherDetails';
import { WeatherHero } from './components/WeatherHero';
import { ErrorState } from './components/states/ErrorState';
import { LoadingState } from './components/states/LoadingState';
import { OfflineState } from './components/states/OfflineState';
import { PermissionDenied } from './components/states/PermissionDenied';
import { useSavedCities } from './hooks/useSavedCities';
import { useUnitPreference } from './hooks/useUnitPreference';
import { useWeather } from './hooks/useWeather';
import { useAppStore } from './store/appStore';

const unitLabels = {
  celsius: 'Metric',
  fahrenheit: 'Imperial',
} as const;

const getWeatherErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return 'The forecast provider did not return a usable packet. Please try again in a moment.';
};

function App() {
  const { currentLocation, isCurrentLocationSaved, saveCurrentLocation, savedLocations } = useSavedCities();
  const geolocationStatus = useAppStore((state) => state.geolocationStatus);
  const { setUnit, unit } = useUnitPreference();
  const weatherQuery = useWeather();
  const [isOffline, setIsOffline] = useState(() => navigator.onLine === false);
  const forecast = weatherQuery.data ?? null;
  const shouldShowPermissionDenied = geolocationStatus === 'denied' && !currentLocation;
  const shouldShowOffline = isOffline && Boolean(currentLocation) && !forecast;
  const shouldShowLoading = Boolean(currentLocation) && weatherQuery.isPending && !forecast && !shouldShowOffline;
  const shouldShowError = Boolean(currentLocation) && weatherQuery.isError && !forecast && !shouldShowOffline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <WeatherBackground forecast={forecast} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_36%),linear-gradient(180deg,_rgba(2,6,23,0.18),_rgba(2,6,23,0.8))]" />

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/8 p-6 shadow-glow backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">Weatherbox</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                A premium live forecast canvas with native-weather polish.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Search for any city, recover gracefully from geolocation failures, and drop into a motion-rich forecast view
                with glass surfaces, adaptive weather scenes, and mobile-first cards.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.55fr,0.85fr]">
              <div className="rounded-[1.9rem] border border-white/10 bg-slate-950/30 p-5">
                <LocationSearch />
              </div>

              <div className="rounded-[1.9rem] border border-white/10 bg-slate-950/30 p-5">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                  <ThermometerSun className="h-4 w-4" />
                  Units
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-3xl border border-white/10 bg-white/5 p-1">
                  {Object.entries(unitLabels).map(([value, label]) => {
                    const isSelected = unit === value;

                    return (
                      <button
                        key={value}
                        className={`rounded-[1.25rem] px-4 py-3 text-sm font-semibold transition ${
                          isSelected ? 'bg-sky-400 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                        }`}
                        type="button"
                        onClick={() => {
                          setUnit(value as 'celsius' | 'fahrenheit');
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Current location</p>
                    <p className="mt-3 text-lg font-semibold">{currentLocation?.name ?? 'Choose a city'}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {currentLocation
                        ? `${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)}`
                        : 'Search or use your device location to begin.'}
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Forecast status</p>
                        <p className="mt-3 text-lg font-semibold">
                          {forecast ? 'Live' : shouldShowLoading ? 'Loading' : shouldShowOffline ? 'Offline' : 'Waiting'}
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/5 p-3 text-sky-100">
                        <Radar className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">
                      {unit === 'celsius'
                        ? 'Metric cards are active across the forecast surface.'
                        : 'Imperial cards are active across the forecast surface.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 xl:grid-cols-[1.5fr,0.92fr]">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {forecast ? (
                <motion.div
                  key={`${forecast.location.id}-${forecast.requestedUnit}`}
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <WeatherHero
                    canSaveLocation={Boolean(currentLocation) && !isCurrentLocationSaved}
                    forecast={forecast}
                    isCurrentLocationSaved={isCurrentLocationSaved}
                    onSaveLocation={saveCurrentLocation}
                  />
                  <HourlyForecast
                    entries={forecast.hourly}
                    precipitationUnit={forecast.units.precipitationProbability}
                    temperatureUnit={forecast.units.temperature}
                    timeZone={forecast.location.timezone}
                  />
                  <DailyForecast
                    entries={forecast.daily}
                    precipitationUnit={forecast.units.precipitationProbability}
                    temperatureUnit={forecast.units.temperature}
                    timeZone={forecast.location.timezone}
                  />
                </motion.div>
              ) : shouldShowLoading ? (
                <motion.div
                  key="loading"
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <LoadingState />
                </motion.div>
              ) : shouldShowOffline ? (
                <motion.div
                  key="offline"
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <OfflineState />
                </motion.div>
              ) : shouldShowPermissionDenied ? (
                <motion.div
                  key="permission"
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <PermissionDenied />
                </motion.div>
              ) : shouldShowError ? (
                <motion.div
                  key="error"
                  animate={{ opacity: 1, y: 0 }}
                  initial={{ opacity: 0, y: 12 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <ErrorState message={getWeatherErrorMessage(weatherQuery.error)} onRetry={() => void weatherQuery.refetch()} />
                </motion.div>
              ) : (
                <motion.section
                  key="empty"
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[2.25rem] border border-white/10 bg-white/8 p-6 backdrop-blur-xl"
                  initial={{ opacity: 0, y: 12 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="text-sm uppercase tracking-[0.35em] text-sky-200">Forecast ready</p>
                  <h2 className="mt-2 text-3xl font-semibold">Choose a city to unlock the live weather scene.</h2>
                  <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                    Once a location is selected, Weatherbox fills this space with animated conditions, hourly cards, a
                    seven-day strip, and a compact detail grid tuned for quick mobile reading.
                  </p>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <motion.section
              animate={{ opacity: 1, x: 0 }}
              className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl"
              initial={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.35, delay: 0.1 }}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full border border-white/10 bg-white/5 p-2">
                  <Compass className="h-5 w-5 text-sky-200" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Saved cities</h2>
                  <p className="text-sm text-slate-300">Quick-switch between your most relevant forecast contexts.</p>
                </div>
              </div>
              <SavedCities />
            </motion.section>

            {forecast ? (
              <motion.div
                animate={{ opacity: 1, x: 0 }}
                initial={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, delay: 0.15 }}
              >
                <WeatherDetails forecast={forecast} />
              </motion.div>
            ) : (
              <motion.section
                animate={{ opacity: 1, x: 0 }}
                className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur-xl"
                initial={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.35, delay: 0.15 }}
              >
                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved presets</p>
                    <p className="mt-3 text-3xl font-semibold">{savedLocations.length}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Unit mode</p>
                    <p className="mt-3 text-3xl font-semibold">{unit === 'celsius' ? 'C' : 'F'}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selection source</p>
                    <p className="mt-3 text-lg font-semibold capitalize">{currentLocation?.source ?? 'none'}</p>
                  </div>
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

