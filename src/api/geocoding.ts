import type { LocationOption } from '../types/location';
import type { OpenMeteoGeocodingResponse } from './types';
import { normalizeLocationSearchResults } from '../utils/formatters';

const OPEN_METEO_GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export const searchLocations = async (query: string, options: { signal?: AbortSignal } = {}): Promise<LocationOption[]> => {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 2) {
    return [];
  }

  try {
    const requestUrl = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
    requestUrl.searchParams.set('name', normalizedQuery);
    requestUrl.searchParams.set('count', '5');
    requestUrl.searchParams.set('language', 'en');
    requestUrl.searchParams.set('format', 'json');

    const response = await fetch(requestUrl, {
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as OpenMeteoGeocodingResponse;
    return normalizeLocationSearchResults(payload.results ?? []);
  } catch (error) {
    console.error('Failed to fetch geocoding results.', error);
    throw error;
  }
};
