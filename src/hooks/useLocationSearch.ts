import { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { searchLocations } from '../api/openmeteo';
import { useAppStore } from '../store/appStore';
import type { LocationOption } from '../types/location';

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
    queryFn: () => searchLocations(debouncedQuery),
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

