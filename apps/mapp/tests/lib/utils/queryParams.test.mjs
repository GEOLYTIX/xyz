/**
## /tests/lib/utils/queryParams

The codi suite built its layer by adding a real GeoJSON layer to a live
mapview, which meant the test could only run inside the application. Everything
`queryParams` reads is a plain property, so a stub layer covers the same ground
and covers more of the branches.

@module /tests/lib/utils/queryParams
*/

import { describe, expect, it } from 'vitest';

/**
@function stubLayer

@description
The minimum layer shape queryParams reads.

@param {Object} [params] Properties merged over the defaults.

@returns {Object} A stub layer.
*/
const stubLayer = (params = {}) => ({
  filter: { current: { field: { gt: 1 } } },
  geomCurrent: () => 'geom_4326',
  key: 'queryParamsLayer',
  mapview: {
    getBounds: () => ({ east: 1, north: 1, south: -1, west: -1 }),
    locale: { key: 'locale' },
    srid: '3857',
  },
  table: 'layer_table',
  ...params,
});

describe('utils/queryParams', () => {
  it('resolves the layer, locale, table, geom and template params', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer(),
      location: { id: '1234' },
      queryparams: {
        geom: 'different_geom',
        id: 1234,
        table: 'different_table',
        template: 'another_template',
      },
    });

    expect(params).toMatchObject({
      geom: 'different_geom',
      id: 1234,
      layer: 'queryParamsLayer',
      locale: 'locale',
      table: 'different_table',
      template: 'another_template',
    });
  });

  it('returns an empty params object for an empty origin', () => {
    expect(mapp.utils.queryParams({})).toEqual({ template: 'undefined' });
  });

  it('merges layer queryparams, with the request taking precedence', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer({
        queryparams: { fromLayer: true, shared: 'layer' },
      }),
      queryparams: { shared: 'request' },
    });

    expect(params.fromLayer).toBe(true);
    expect(params.shared).toEqual('request');
  });

  it('resolves a true geom flag from the layer', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer(),
      queryparams: { geom: true },
    });

    expect(params.geom).toEqual('geom_4326');
  });

  it('resolves a true table flag from the layer', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer(),
      queryparams: { table: true },
    });

    expect(params.table).toEqual('layer_table');
  });

  it('resolves a true filter flag from the layer filter', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer(),
      queryparams: { filter: true },
    });

    expect(params.filter).toEqual({ field: { gt: 1 } });
  });

  it('resolves a true id flag from the location', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer(),
      location: { id: '1234' },
      queryparams: { id: true },
    });

    expect(params.id).toEqual('1234');
  });

  it('builds the viewport from the mapview bounds and srid', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer(),
      queryparams: { viewport: true },
    });

    expect(params.viewport).toEqual([-1, -1, 1, 1, '3857']);
  });

  it('drops a true viewport flag when there is no mapview', () => {
    const params = mapp.utils.queryParams({
      layer: stubLayer({ mapview: undefined }),
      queryparams: { viewport: true },
    });

    expect(params).not.toHaveProperty('viewport');
  });

  it('reads the layer from a location when the origin has none', () => {
    const params = mapp.utils.queryParams({
      location: { layer: stubLayer() },
    });

    expect(params.layer).toEqual('queryParamsLayer');
    expect(params.locale).toEqual('locale');
  });
});
