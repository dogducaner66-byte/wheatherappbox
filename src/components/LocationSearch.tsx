import { LocateFixed, Search } from 'lucide-react';
import { useId, useRef } from 'react';

import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationSearch } from '../hooks/useLocationSearch';

interface LocationSearchProps {
  debounceMs?: number;
}

export const LocationSearch = ({ debounceMs }: LocationSearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const {
    activeIndex,
    emptyStateMessage,
    isLoading,
    isOpen,
    query,
    results,
    searchError,
    selectLocation,
    setActiveIndex,
    setIsOpen,
    setQuery,
  } = useLocationSearch(debounceMs);
  const { clearGeolocationError, errorMessage, geolocationStatus, requestCurrentLocation } = useGeolocation();

  const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined;

  const openSearch = () => {
    if (query.trim().length >= 2 || results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleGeolocationClick = async () => {
    const didResolveLocation = await requestCurrentLocation();

    if (didResolveLocation) {
      return;
    }

    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search for a city</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-sky-200" />
          <input
            ref={inputRef}
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-expanded={isOpen}
            className="w-full rounded-3xl border border-white/10 bg-white/10 py-4 pl-12 pr-4 text-base text-white outline-none ring-0 placeholder:text-slate-300 focus:border-sky-300"
            placeholder="Search cities, airports, and regions"
            value={query}
            onBlur={() => {
              window.setTimeout(() => {
                setIsOpen(false);
              }, 100);
            }}
            onChange={(event) => {
              clearGeolocationError();
              setQuery(event.target.value);
              setIsOpen(event.target.value.trim().length >= 2);
            }}
            onFocus={openSearch}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((previousIndex) => {
                  if (results.length === 0) {
                    return -1;
                  }

                  return previousIndex >= results.length - 1 ? 0 : previousIndex + 1;
                });
              }

              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setIsOpen(true);
                setActiveIndex((previousIndex) => {
                  if (results.length === 0) {
                    return -1;
                  }

                  return previousIndex <= 0 ? results.length - 1 : previousIndex - 1;
                });
              }

              if (event.key === 'Enter' && isOpen && activeIndex >= 0) {
                event.preventDefault();
                selectLocation(results[activeIndex]);
              }

              if (event.key === 'Escape') {
                setIsOpen(false);
              }
            }}
          />
        </label>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-3xl border border-sky-300/30 bg-sky-400/10 px-5 py-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-400/20"
          onClick={handleGeolocationClick}
        >
          <LocateFixed className="h-5 w-5" />
          {geolocationStatus === 'requesting' ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {searchError ? (
        <p className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100" role="alert">
          {searchError}
        </p>
      ) : null}

      {isOpen ? (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900/90 shadow-glow backdrop-blur">
          <ul aria-label="Location suggestions" className="max-h-80 overflow-auto py-2" id={listboxId} role="listbox">
            {isLoading ? (
              <li className="px-4 py-3 text-sm text-slate-200">Searching for matches…</li>
            ) : null}

            {!isLoading
              ? results.map((result, index) => (
                  <li
                    aria-selected={activeIndex === index}
                    className={`cursor-pointer px-4 py-3 text-sm text-slate-100 ${
                      activeIndex === index ? 'bg-sky-400/20 text-white' : 'hover:bg-white/5'
                    }`}
                    id={`${listboxId}-option-${index}`}
                    key={result.id}
                    role="option"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      selectLocation(result);
                    }}
                  >
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-slate-300">{result.label}</div>
                  </li>
                ))
              : null}

            {!isLoading && emptyStateMessage ? <li className="px-4 py-3 text-sm text-slate-200">{emptyStateMessage}</li> : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

