import { afterEach, describe, expect, it, vi } from 'vitest';

import { searchLocations } from '../../src/api/openmeteo';

describe('searchLocations', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests normalized location matches from Open-Meteo', async () => {
    const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        results: [
          {
            id: 123,
            name: 'Paris',
            country: 'France',
            admin1: 'Ile-de-France',
            latitude: 48.8566,
            longitude: 2.3522,
            timezone: 'Europe/Paris',
          },
        ],
      }),
    } as Response);

    await expect(searchLocations('Par')).resolves.toEqual([
      {
        id: '123',
        name: 'Paris',
        label: 'Paris, Ile-de-France, France',
        country: 'France',
        region: 'Ile-de-France',
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: 'Europe/Paris',
        source: 'search',
      },
    ]);

    const requestUrl = fetchMock.mock.calls[0][0] as URL;
    expect(requestUrl.toString()).toContain('geocoding-api.open-meteo.com');
    expect(requestUrl.searchParams.get('name')).toBe('Par');
    expect(requestUrl.searchParams.get('count')).toBe('5');
    expect(requestUrl.searchParams.get('language')).toBe('en');
    expect(requestUrl.searchParams.get('format')).toBe('json');
  });

  it('logs and rethrows when the Open-Meteo request fails', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
    } as Response);

    await expect(searchLocations('Paris')).rejects.toThrow('Geocoding request failed with status 503');
    expect(consoleError).toHaveBeenCalledWith('Failed to fetch geocoding results.', expect.any(Error));
  });
});
