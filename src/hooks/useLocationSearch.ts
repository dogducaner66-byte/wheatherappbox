import { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAppStore } from '../store/appStore';
import type { LocationOption } from '../types/location';

interface GeocodingApiResult {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

interface GeocodingApiResponse {
  results?: GeocodingApiResult[];
}

const useDebouncedValue = (value: string, delayMs: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, value]);

  return debouncedValue;
};

const createLocationLabel = (result: GeocodingApiResult): string => {
  return [result.name, result.admin1, result.country].filter(Boolean).join(', ');
};

const normalizeLocations = (results: GeocodingApiResult[]): LocationOption[] => {
  return results.map((result) => ({
    id: String(result.id ?? `${result.name}-${result.latitude}-${result.longitude}`),
    name: result.name,
    label: createLocationLabel(result),
    country: result.country,
    region: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
    source: 'search',
  }));
};

export const useLocationSearch = (debounceMs = 300) => {
  const currentLocation = useAppStore((state) => state.currentLocation);
  const setCurrentLocation = useAppStore((state) => state.setCurrentLocation);
  const [query, setQuery] = useState(currentLocation?.label ?? '');
  const [selectedLabel, setSelectedLabel] = useState(currentLocation?.label ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, debounceMs);

  useEffect(() => {
    const nextLabel = currentLocation?.label ?? '';
    setQuery(nextLabel);
    setSelectedLabel(nextLabel);
  }, [currentLocation?.label]);

  const searchQuery = useQuery({
    queryKey: ['location-search', debouncedQuery],
    enabled: debouncedQuery.length >= 2 && debouncedQuery !== selectedLabel,
    queryFn: async () => {
      try {
        const requestUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
        requestUrl.searchParams.set('name', debouncedQuery);
        requestUrl.searchParams.set('count', '5');
        requestUrl.searchParams.set('language', 'en');
        requestUrl.searchParams.set('format', 'json');

        const response = await fetch(requestUrl);

        if (!response.ok) {
          throw new Error(`Geocoding request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as GeocodingApiResponse;
        return normalizeLocations(payload.results ?? []);
      } catch (error) {
        console.error('Failed to fetch geocoding results.', error);
        throw error;
      }
    },
  });

  const results = useMemo(() => searchQuery.data ?? [], [searchQuery.data]);

  useEffect(() => {
    if (!isOpen) {
      setActiveIndex(-1);
      return;
    }

    if (results.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((previousIndex) => {
      if (previousIndex < 0 || previousIndex >= results.length) {
        return 0;
      }

      return previousIndex;
    });
  }, [isOpen, results]);

  const selectLocation = (location: LocationOption) => {
    setCurrentLocation({
      ...location,
      source: 'search',
    });
    setQuery(location.label);
    setSelectedLabel(location.label);
    setIsOpen(false);
  };

  const emptyStateMessage = useMemo(() => {
    if (trimmedQuery.length < 2 || searchQuery.isLoading || searchQuery.isError) {
      return null;
    }

    return results.length === 0 ? 'No matching cities found.' : null;
  }, [results.length, searchQuery.isError, searchQuery.isLoading, trimmedQuery.length]);

  return {
    activeIndex,
    emptyStateMessage,
    isLoading: searchQuery.isLoading,
    isOpen,
    query,
    results,
    searchError: searchQuery.isError ? 'We could not load location matches. Try again.' : null,
    selectLocation,
    setActiveIndex,
    setIsOpen,
    setQuery,
  };
};

