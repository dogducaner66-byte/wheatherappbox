import { describe, expect, it } from 'vitest';

import { formatLocationLabel, normalizeLocationSearchResults } from '../../src/utils/formatters';

describe('location formatters', () => {
  it('joins only the defined location parts into a label', () => {
    expect(
      formatLocationLabel({
        name: 'Paris',
        admin1: 'Ile-de-France',
        country: 'France',
      }),
    ).toBe('Paris, Ile-de-France, France');

    expect(
      formatLocationLabel({
        name: 'Reykjavik',
        country: 'Iceland',
      }),
    ).toBe('Reykjavik, Iceland');
  });

  it('keeps explicit ids and omits undefined region and country fields', () => {
    expect(
      normalizeLocationSearchResults([
        {
          id: 0,
          name: 'Nuuk',
          latitude: 64.1835,
          longitude: -51.7216,
        },
      ]),
    ).toEqual([
      {
        id: '0',
        name: 'Nuuk',
        label: 'Nuuk',
        country: undefined,
        region: undefined,
        latitude: 64.1835,
        longitude: -51.7216,
        timezone: undefined,
        source: 'search',
      },
    ]);
  });

  it('normalizes geocoding results and falls back to a deterministic id when the API omits one', () => {
    expect(
      normalizeLocationSearchResults([
        {
          name: 'Tokyo',
          country: 'Japan',
          admin1: 'Tokyo',
          latitude: 35.6762,
          longitude: 139.6503,
          timezone: 'Asia/Tokyo',
        },
      ]),
    ).toEqual([
      {
        id: 'Tokyo-35.6762-139.6503',
        name: 'Tokyo',
        label: 'Tokyo, Tokyo, Japan',
        country: 'Japan',
        region: 'Tokyo',
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: 'Asia/Tokyo',
        source: 'search',
      },
    ]);
  });

  it('drops malformed geocoding rows instead of emitting partially invalid options', () => {
    expect(
      normalizeLocationSearchResults([
        {
          id: 10,
          name: '  ',
          latitude: 48.85,
          longitude: 2.35,
        },
        {
          id: 11,
          name: 'Paris',
          latitude: undefined,
          longitude: 2.35,
        },
        {
          id: 12,
          name: 'Berlin',
          latitude: 52.52,
          longitude: 13.405,
        },
      ]),
    ).toEqual([
      {
        id: '12',
        name: 'Berlin',
        label: 'Berlin',
        country: undefined,
        region: undefined,
        latitude: 52.52,
        longitude: 13.405,
        timezone: undefined,
        source: 'search',
      },
    ]);
  });
});
