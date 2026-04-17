import { describe, expect, it } from 'vitest';

import { getWeatherCodeMeta } from '../../src/utils/weatherCodes';

describe('weather code metadata', () => {
  it('maps known WMO codes to stable labels, kinds, and day gradients', () => {
    expect(getWeatherCodeMeta(0, true)).toEqual({
      code: 0,
      label: 'Clear sky',
      kind: 'clear',
      gradient: 'clear-day',
    });

    expect(getWeatherCodeMeta(61, true)).toEqual({
      code: 61,
      label: 'Rain: slight',
      kind: 'rain',
      gradient: 'rain-day',
    });
  });

  it('switches gradient keys for codes whose visuals depend on day versus night', () => {
    expect(getWeatherCodeMeta(2, true).gradient).toBe('clouds-day');
    expect(getWeatherCodeMeta(2, false).gradient).toBe('clouds-night');
    expect(getWeatherCodeMeta(63, false).gradient).toBe('rain-night');
  });

  it('falls back to unknown conditions for invalid or missing weather codes', () => {
    expect(getWeatherCodeMeta(undefined, true)).toEqual({
      code: -1,
      label: 'Unknown conditions',
      kind: 'unknown',
      gradient: 'clouds-day',
    });

    expect(getWeatherCodeMeta(Number.NaN, false)).toEqual({
      code: -1,
      label: 'Unknown conditions',
      kind: 'unknown',
      gradient: 'clouds-night',
    });
  });
});
