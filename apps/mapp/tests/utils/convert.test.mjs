import { afterEach, describe, expect, it, vi } from 'vitest';
import convert from '../../lib/utils/convert.mjs';

// The convert module imports the convert library from esm.sh with mapp.utils.esmImport. The stub prevents the network request and converts with fixed factors.
const factors = { m: 1, km: 1000, ft: 0.3048 };

const convertLibrary = {
  convert: (value, from) => ({
    to: (to) => (value * factors[from]) / factors[to],
  }),
};

function stubEsmImport(module = convertLibrary) {
  return vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(module);
}

afterEach(() => {
  vi.restoreAllMocks();
});

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
    stubEsmImport();

    await expect(convert(value, params)).resolves.toBe(expected);
  });

  it('converts with the module from esmImport', async () => {
    const esmImport = stubEsmImport({
      convert: () => ({ to: () => 42 }),
    });

    await expect(convert(1, { units: 'm', convertTo: 'km' })).resolves.toBe(
      '42',
    );

    expect(esmImport).toHaveBeenCalledWith('convert@4');
  });

  it('only imports the module for a conversion', async () => {
    const esmImport = stubEsmImport();

    await convert(1, { units: 'm' });

    expect(esmImport).not.toHaveBeenCalled();
  });

  it('formats the value without conversion if the import fails', async () => {
    stubEsmImport(new Error('Failed to fetch'));

    await expect(convert(2500, { units: 'm', convertTo: 'km' })).resolves.toBe(
      '2500',
    );
  });
});
