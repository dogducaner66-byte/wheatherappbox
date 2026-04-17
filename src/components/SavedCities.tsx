import { Trash2 } from 'lucide-react';

import { useSavedCities } from '../hooks/useSavedCities';

export const SavedCities = () => {
  const { currentLocation, removeSavedLocation, savedLocations, switchToSavedLocation } = useSavedCities();

  if (savedLocations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-slate-300">
        Save a city to build a quick-switch shortlist for future forecasts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedLocations.map((location) => {
        const isActive = currentLocation?.id === location.id;

        return (
          <div
            className={`flex items-center justify-between gap-3 rounded-3xl border px-4 py-3 ${
              isActive ? 'border-sky-300/40 bg-sky-400/10' : 'border-white/10 bg-white/5'
            }`}
            key={location.id}
          >
            <button
              aria-label={`Switch to ${location.name}`}
              aria-pressed={isActive}
              type="button"
              className="flex-1 text-left"
              onClick={() => {
                switchToSavedLocation(location.id);
              }}
            >
              <div className="font-semibold text-white">{location.name}</div>
              <div className="text-xs text-slate-300">{location.label}</div>
            </button>

            <button
              aria-label={`Remove ${location.name}`}
              className="rounded-full border border-white/10 p-2 text-slate-300 transition hover:border-rose-300/40 hover:text-rose-200"
              type="button"
              onClick={() => {
                removeSavedLocation(location.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

