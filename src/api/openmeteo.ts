import type { LocationOption } from '../types/location';
import type { GeocodingApiResult } from '../utils/formatters';
import { normalizeLocationSearchResults } from '../utils/formatters';

interface GeocodingApiResponse {
  results?: GeocodingApiResult[];
}

const OPEN_METEO_GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

export const searchLocations = async (query: string): Promise<LocationOption[]> => {
  try {
    const requestUrl = new URL(OPEN_METEO_GEOCODING_ENDPOINT);
    requestUrl.searchParams.set('name', query);
    requestUrl.searchParams.set('count', '5');
    requestUrl.searchParams.set('language', 'en');
    requestUrl.searchParams.set('format', 'json');

    const response = await fetch(requestUrl);

    if (!response.ok) {
      throw new Error(`Geocoding request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as GeocodingApiResponse;
    return normalizeLocationSearchResults(payload.results ?? []);
  } catch (error) {
    console.error('Failed to fetch geocoding results.', error);
    throw error;
  }
};
