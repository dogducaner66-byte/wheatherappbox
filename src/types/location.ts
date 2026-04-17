export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type LocationSource = 'search' | 'geolocation' | 'saved';
export type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unsupported' | 'error';

export interface LocationOption {
  id: string;
  name: string;
  label: string;
  country?: string;
  region?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  source: LocationSource;
}

