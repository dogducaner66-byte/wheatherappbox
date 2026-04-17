import type { LocationOption } from '../types/location';

export interface GeocodingApiResult {
  id?: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export const formatLocationLabel = (result: Pick<GeocodingApiResult, 'name' | 'admin1' | 'country'>): string => {
  return [result.name, result.admin1, result.country].filter(Boolean).join(', ');
};

export const normalizeLocationSearchResults = (results: GeocodingApiResult[]): LocationOption[] => {
  return results.map((result) => ({
    id: String(result.id ?? `${result.name}-${result.latitude}-${result.longitude}`),
    name: result.name,
    label: formatLocationLabel(result),
    country: result.country,
    region: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
    source: 'search',
  }));
};
