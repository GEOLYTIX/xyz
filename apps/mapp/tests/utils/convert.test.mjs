import { describe, expect, it, vi } from 'vitest';
import convert from '../../lib/utils/convert.mjs';

// The convert module imports the convert library from the skypack CDN. The mock prevents the network request and converts with fixed factors.
const factors = { m: 1, km: 1000, ft: 0.3048 };

vi.mock('https://cdn.skypack.dev/convert@4', () => ({
  convert: (value, from) => ({
    to: (to) => (value * factors[from]) / factors[to],
  }),
}));

describe('utils/convert', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.convert).toBe(convert);
  });

  it.each([
    ['1234.567', {}, '1235'],
    [1234.567, { decimals: 2 }, '1234.57'],
    [12, { prefix: '£', suffix: ' total' }, '£12 total'],
    [2500, { units: 'm', convertTo: 'km', decimals: 1 }, '2.5'],
    [1000, { units: 'ft', convertTo: 'm', suffix: 'm' }, '305m'],
    // Without convertTo the value is not converted.
    [2500, { units: 'm' }, '2500'],
  ])('convert(%o, %o) returns %s', async (value, params, expected) => {
    await expect(convert(value, params)).resolves.toBe(expected);
  });
});
