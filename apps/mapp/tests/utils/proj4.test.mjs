import { afterEach, describe, expect, it, vi } from 'vitest';
import { proj4 } from '../../lib/utils/proj4.mjs';

// A stand-in for the proj4 module which offsets coordinates by 1000.
function mockProj4() {
  const transform = vi.fn((from, to, coord) =>
    from === 'EPSG:3857'
      ? [coord[0] + 1000, coord[1] + 1000]
      : [coord[0] - 1000, coord[1] - 1000],
  );

  transform.defs = vi.fn();

  return { default: transform };
}

describe('utils/proj4', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.proj4).toBe(proj4);
  });

  it('adds a projection with transforms from and to EPSG:3857', async () => {
    const mod = mockProj4();

    const esmImport = vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(mod);

    const params = {
      name: 'EPSG:TEST1',
      defs: '+proj=test',
      extent: [0, 0, 700000, 1300000],
    };

    await proj4.addProjection(params);

    expect(esmImport).toHaveBeenCalledWith('proj4@2.9.0');
    expect(mod.default.defs).toHaveBeenCalledWith('EPSG:TEST1', '+proj=test');

    const projection = ol.proj.get('EPSG:TEST1');

    expect(projection.getCode()).toBe('EPSG:TEST1');
    expect(projection.getExtent()).toEqual(params.extent);

    expect(ol.proj.transform([1, 2], 'EPSG:3857', 'EPSG:TEST1')).toEqual([
      1001, 1002,
    ]);

    expect(ol.proj.transform([1001, 1002], 'EPSG:TEST1', 'EPSG:3857')).toEqual([
      1, 2,
    ]);
  });

  it('returns without a projection if the proj4 import fails', async () => {
    vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(new Error('offline'));

    await proj4.addProjection({ name: 'EPSG:TEST2', defs: '', extent: [] });

    expect(ol.proj.get('EPSG:TEST2')).toBeNull();
  });
});
