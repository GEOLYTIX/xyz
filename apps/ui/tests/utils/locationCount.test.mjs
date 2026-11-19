import { describe, expect, it, vi } from 'vitest';
import { groceryMapview } from '../helpers.mjs';

const { locationCount } = mapp.ui.utils;

/**
Returns the search params of the location_count requests. The layers of the mapview also request their data with the mapp.utils.xhr method.
*/
function counts(xhr) {
  return xhr.mock.calls
    .map(([url]) => url)
    .filter((url) => url?.includes?.('template=location_count'))
    .map((url) => new URL(url).searchParams);
}

/**
Returns the retail_points layer of a grocery mapview. The features of the wkt layer are loaded for the viewport.

The layer decorator sets the layer.filter.viewport flag, because the layer.params are restricted to the viewport.
*/
async function retailPoints() {
  const mapview = await groceryMapview();

  return mapview.layers.retail_points;
}

describe('ui/utils/locationCount', () => {
  it('counts the layer features without a viewport filter', async () => {
    const layer = { format: 'wkt', Features: [{}, {}, {}] };

    await expect(locationCount(layer)).resolves.toBe(3);
  });

  it('counts the features of the latest layer data request', async () => {
    let resolve;

    const layer = {
      format: 'wkt',
      Features: [{}],
      loading: new Promise((r) => {
        resolve = r;
      }),
    };

    const count = locationCount(layer);

    // The features of the pending request are set before the loading promise resolves.
    layer.Features = [{}, {}];

    resolve();

    await expect(count).resolves.toBe(2);
  });

  it('counts the features which have been loaded for the viewport', async () => {
    const layer = await retailPoints();

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    expect(layer.filter.viewport).toBe(true);

    const count = await locationCount(layer);

    expect(count).toBeGreaterThan(0);
    expect(count).toBe(layer.Features.length);
    expect(counts(xhr)).toHaveLength(0);
  });

  it('queries the location_count of a cluster layer', async () => {
    const layer = await retailPoints();

    const viewportCount = layer.Features.length;

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    layer.format = 'cluster';

    delete layer.filter.viewport;

    const count = await locationCount(layer);

    const [params] = counts(xhr);

    expect(params.get('layer')).toBe('retail_points');
    expect(params.get('table')).toBe('geodata.uk_glx_open_retail_points');
    expect(params.get('geom')).toBe('geom_p_4326');
    expect(params.get('qID')).toBe('id');
    expect(params.has('viewport')).toBe(false);

    // All the stores are counted without the viewport.
    expect(count).toBeGreaterThan(viewportCount);
  });

  it('queries the location_count in the viewport if the features have not been loaded for the viewport', async () => {
    const layer = await retailPoints();

    const viewportCount = layer.Features.length;

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    layer.filter.viewport = true;

    // The layer features are not restricted to the viewport.
    delete layer.params.viewport;

    const count = await locationCount(layer);

    const [params] = counts(xhr);

    expect(params.get('viewport')).toMatch(/^[-\d.]+,[-\d.]+,[-\d.]+,[-\d.]+,/);

    expect(count).toBe(viewportCount);
  });

  it('queries the location_count with the current filter', async () => {
    const layer = await retailPoints();

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    layer.format = 'cluster';
    layer.filter.current = { retailer: { in: ['Lidl'] } };

    const count = await locationCount(layer);

    const [params] = counts(xhr);

    expect(JSON.parse(params.get('filter'))).toEqual({
      retailer: { in: ['Lidl'] },
    });

    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(layer.Features.length);
  });

  it('queries the location_count in the viewport if the query fails', async () => {
    const layer = await retailPoints();

    layer.format = 'cluster';

    delete layer.filter.viewport;

    const xhr = vi
      .spyOn(mapp.utils, 'xhr')
      .mockResolvedValueOnce(new Error('timeout'));

    const count = await locationCount(layer);

    const [first, second] = counts(xhr);

    expect(counts(xhr)).toHaveLength(2);
    expect(first.has('viewport')).toBe(false);
    expect(second.has('viewport')).toBe(true);

    expect(count).toBeGreaterThan(0);
  });

  it('warns and returns undefined if the query in the viewport fails', async () => {
    const layer = await retailPoints();

    layer.format = 'cluster';

    delete layer.filter.viewport;

    const xhr = vi
      .spyOn(mapp.utils, 'xhr')
      .mockResolvedValue(new Error('timeout'));

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(locationCount(layer)).resolves.toBeUndefined();

    // The query without the viewport and the query in the viewport.
    expect(counts(xhr)).toHaveLength(2);

    expect(warn).toHaveBeenCalledExactlyOnceWith(
      'locationCount failed on viewport.',
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3111: the fallback for a failed query sets the layer.filter.viewport to true, and does not restore it. Every following count of the layer is restricted to the viewport.
  it.fails('does not change the viewport filter of the layer', async () => {
    const layer = await retailPoints();

    layer.format = 'cluster';

    delete layer.filter.viewport;

    vi.spyOn(mapp.utils, 'xhr').mockResolvedValueOnce(new Error('timeout'));

    await locationCount(layer);

    expect(layer.filter.viewport).toBeUndefined();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3111: the fallback for a failed query assigns the viewport to the layer.filter, which throws a TypeError for a layer without a filter. The rest of the method checks layer.filter with optional chaining.
  it.fails(
    'falls back to the viewport for a layer without a filter',
    async () => {
      const layer = await retailPoints();

      layer.format = 'cluster';

      delete layer.filter;

      vi.spyOn(mapp.utils, 'xhr').mockResolvedValueOnce(new Error('timeout'));

      await expect(locationCount(layer)).resolves.toBeGreaterThan(0);
    },
  );
});
