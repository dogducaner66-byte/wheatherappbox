import { AnimatePresence, motion } from 'framer-motion';
import { Compass, MapPinned, ThermometerSun } from 'lucide-react';

import { LocationSearch } from './components/LocationSearch';
import { SavedCities } from './components/SavedCities';
import { useSavedCities } from './hooks/useSavedCities';
import { useUnitPreference } from './hooks/useUnitPreference';

const unitLabels = {
  celsius: 'Metric',
  fahrenheit: 'Imperial',
} as const;

function App() {
  const { currentLocation, isCurrentLocationSaved, saveCurrentLocation, savedLocations } = useSavedCities();
  const { setUnit, unit } = useUnitPreference();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.25),_transparent_45%),linear-gradient(180deg,_#020617_0%,_#0f172a_48%,_#111827_100%)] text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <motion.section
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-glow backdrop-blur"
          initial={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.25em] text-sky-200">Weatherbox</p>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                Premium weather search and location controls, ready for forecast packets.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Search for a city, recover gracefully from geolocation failures, keep a saved shortlist, and persist unit
                and location preferences across visits.
              </p>
            </div>

            <LocationSearch />

            <div className="grid gap-4 lg:grid-cols-[1.4fr,0.8fr]">
              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-300">
                      <MapPinned className="h-4 w-4" />
                      Active location
                    </div>
                    <h2 className="text-2xl font-semibold">
                      {currentLocation?.name ?? 'Search or use geolocation to start'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-300">
                      {currentLocation
                        ? `${currentLocation.label} • ${currentLocation.latitude.toFixed(2)}, ${currentLocation.longitude.toFixed(2)}`
                        : 'Your current selection is stored locally so later forecast packets can hydrate around it.'}
                    </p>
                  </div>

                  <button
                    className="rounded-full border border-sky-300/30 bg-sky-400/10 px-4 py-2 text-sm font-semibold text-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!currentLocation || isCurrentLocationSaved}
                    type="button"
                    onClick={saveCurrentLocation}
                  >
                    {isCurrentLocationSaved ? 'Saved' : 'Save location'}
                  </button>
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5">
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
                <p className="mt-4 text-sm text-slate-300">
                  {unit === 'celsius' ? 'Metric forecast cards will render by default.' : 'Imperial forecast cards will render by default.'}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
            initial={{ opacity: 0, x: -16 }}
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

          <motion.section
            animate={{ opacity: 1, x: 0 }}
            className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur"
            initial={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Integration contract status</h2>
                <p className="text-sm text-slate-300">This shell is now ready for forecast-provider and normalized-domain packets.</p>
              </div>
              <div className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Ready
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentLocation?.id ?? 'empty-state'}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-3 sm:grid-cols-3"
                exit={{ opacity: 0, y: -8 }}
                initial={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.25 }}
              >
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Saved presets</p>
                  <p className="mt-3 text-3xl font-semibold">{savedLocations.length}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Unit mode</p>
                  <p className="mt-3 text-3xl font-semibold">{unit === 'celsius' ? 'C' : 'F'}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Selection source</p>
                  <p className="mt-3 text-lg font-semibold capitalize">{currentLocation?.source ?? 'search'}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

export default App;

