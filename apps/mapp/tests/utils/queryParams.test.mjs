import { afterEach, describe, expect, it, vi } from 'vitest';
import queryParams from '../../lib/utils/queryParams.mjs';

/**
Returns a stub mapview with a getBounds method, srid, and an Openlayers Map view.
*/
function stubMapview({ center = [0, 0], zoom = 10, srid = '3857' } = {}) {
  return {
    srid,
    locale: { key: 'test_locale' },
    getBounds: vi.fn(() => ({ west: 1, south: 2, east: 3, north: 4 })),
    Map: {
      getView: () => ({
        getCenter: () => center,
        getZoom: () => zoom,
      }),
    },
  };
}

describe('utils/queryParams', () => {
  afterEach(() => {
    delete mapp.user;
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.queryParams).toBe(queryParams);
  });

  it('assigns an empty queryparams object and the encoded query template', () => {
    const _this = { query: 'my query' };

    const params = queryParams(_this);

    expect(_this.queryparams).toEqual({});
    expect(params.template).toBe('my%20query');
    expect(params.locale).toBeUndefined();
    expect(params.layer).toBeUndefined();
  });

  it('keeps an explicit template', () => {
    expect(
      queryParams({ query: 'ignored', queryparams: { template: 'tpl' } })
        .template,
    ).toBe('tpl');
  });

  it('merges the layer queryparams with precedence for the queryparams', () => {
    const layer = { key: 'layer', queryparams: { a: 1, b: 1 } };

    const _this = { layer, queryparams: { b: 2 } };

    const params = queryParams(_this);

    expect(params.a).toBe(1);
    expect(params.b).toBe(2);
    expect(_this.queryparams).toEqual({ a: 1, b: 2 });
  });

  it('assigns the locale and layer params from the layer', () => {
    const layer = { key: 'roads', mapview: stubMapview() };

    const params = queryParams({ layer });

    expect(params.locale).toBe('test_locale');
    expect(params.layer).toBe('roads');
  });

  it('assigns the locale and layer params from a location', () => {
    const params = queryParams({
      location: { locale: 'loc_locale', layer: { key: 'loc_layer' } },
    });

    expect(params.locale).toBe('loc_locale');
    expect(params.layer).toBe('loc_layer');
  });

  it('keeps explicit locale and layer strings', () => {
    const layer = { key: 'roads', mapview: stubMapview() };

    const params = queryParams({
      layer,
      queryparams: { locale: 'explicit', layer: 'explicit_layer' },
    });

    expect(params.locale).toBe('explicit');
    expect(params.layer).toBe('explicit_layer');
  });

  it('assigns the viewport from _this.viewport', () => {
    expect(queryParams({ viewport: 'v' }).viewport).toBe('v');
  });

  describe('table', () => {
    it.each([
      [
        'an explicit table string',
        { queryparams: { table: 'explicit' }, layer: { table: 'layer' } },
        'explicit',
      ],
      [
        'the location layer table',
        {
          queryparams: { table: true },
          location: { layer: { table: 'location_table' } },
          layer: { table: 'layer_table' },
        },
        'location_table',
      ],
      [
        'the layer table',
        { queryparams: { table: true }, layer: { table: 'layer_table' } },
        'layer_table',
      ],
      [
        'the location layer tableCurrent',
        {
          queryparams: { table: true },
          location: { layer: { tableCurrent: () => 'location_current' } },
        },
        'location_current',
      ],
      [
        'the layer tableCurrent',
        {
          queryparams: { table: true },
          layer: { tableCurrent: () => 'layer_current' },
        },
        'layer_current',
      ],
      [
        'the first layer tables value',
        {
          queryparams: { table: true },
          layer: { tables: { 5: null, 10: 'layer_tables' } },
        },
        'layer_tables',
      ],
      [
        'the first location layer tables value',
        {
          queryparams: { table: true },
          location: { layer: { tables: { 5: null, 10: 'location_tables' } } },
        },
        'location_tables',
      ],
      ['true without a table source', { queryparams: { table: true } }, true],
      ['undefined without a table param', {}, undefined],
    ])('assigns %s', (_, _this, expected) => {
      expect(queryParams(_this).table).toBe(expected);
    });
  });

  describe('viewport', () => {
    it('keeps a viewport string', () => {
      expect(
        queryParams({ queryparams: { viewport: 'explicit' } }).viewport,
      ).toBe('explicit');
    });

    it('deletes the viewport flag without a mapview', () => {
      const params = queryParams({ queryparams: { viewport: true } });

      expect(Object.hasOwn(params, 'viewport')).toBe(false);
    });

    it.each([
      ['layer', (mapview) => ({ layer: { mapview } })],
      ['location layer', (mapview) => ({ location: { layer: { mapview } } })],
    ])('assigns the bounds and srid of the %s mapview', (_, create) => {
      const mapview = stubMapview();

      const params = queryParams({
        ...create(mapview),
        queryparams: { viewport: true },
      });

      expect(params.viewport).toEqual([1, 2, 3, 4, '3857']);
      expect(mapview.getBounds).toHaveBeenCalledOnce();
    });
  });

  it('assigns the current layer geom', () => {
    const params = queryParams({
      layer: { geomCurrent: () => 'geom_10' },
      queryparams: { geom: true },
    });

    expect(params.geom).toBe('geom_10');
  });

  it('keeps an explicit geom', () => {
    expect(queryParams({ queryparams: { geom: 'g' } }).geom).toBe('g');
  });

  describe('center', () => {
    it('keeps a center string', () => {
      expect(queryParams({ queryparams: { center: 'c' } }).center).toBe('c');
    });

    it('assigns the mapview center in EPSG:4326 with lat and lng', () => {
      const center = ol.proj.fromLonLat([-0.1276, 51.5072]);

      const params = queryParams({
        layer: { mapview: stubMapview({ center }) },
        queryparams: { center: true },
      });

      expect(params.center[0]).toBeCloseTo(-0.1276, 6);
      expect(params.center[1]).toBeCloseTo(51.5072, 6);

      // The lat and lng are assigned from the untransformed center.
      expect(params.lat).toBe(center[1]);
      expect(params.lng).toBe(center[0]);
    });
  });

  it.each([
    [
      'filter',
      { layer: { filter: { current: { a: 1 } } } },
      'filter',
      { a: 1 },
    ],
    ['id', { location: { id: 7 } }, 'id', 7],
    ['qID', { location: { layer: { qID: 'fid' } } }, 'qID', 'fid'],
    ['z', { layer: { mapview: stubMapview({ zoom: 12 }) } }, 'z', 12],
  ])('resolves a true %s flag', (_, _this, key, expected) => {
    _this.queryparams = { [key]: true };

    expect(queryParams(_this)[key]).toEqual(expected);
  });

  it('resolves a true email flag from the mapp.user', () => {
    mapp.user = { email: 'user@example.com' };

    expect(queryParams({ queryparams: { email: true } }).email).toBe(
      'user@example.com',
    );
  });
});
