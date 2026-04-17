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
});
