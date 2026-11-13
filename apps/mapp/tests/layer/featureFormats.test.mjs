import { afterEach, describe, expect, it, vi } from 'vitest';
import * as featureFormats from '../../lib/layer/featureFormats.mjs';

function layer(fields = [], params = {}) {
  return {
    srid: '4326',
    mapview: { srid: '3857' },
    params: { fields, ...params },
    style: {},
    L: { changed: vi.fn() },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('layer/featureFormats', () => {
  describe('wkt', () => {
    it('creates features with projected geometries and properties', () => {
      const l = layer(['name', 'category']);

      const features = featureFormats.wkt(l, [
        [1, 'POINT(0 0)', 'Null Island', 'island'],
        [2, 'LINESTRING(0 0,1 1)', 'Line', null],
      ]);

      expect(features).toHaveLength(2);

      expect(features[0].getProperties()).toMatchObject({
        id: 1,
        name: 'Null Island',
        category: 'island',
        wkt_geometry: 'POINT(0 0)',
      });

      expect(features[1].getGeometry().getType()).toBe('LineString');

      // EPSG:4326 1,1 projected to EPSG:3857.
      const [x, y] = features[1].getGeometry().getLastCoordinate();
      expect(x).toBeCloseTo(111319.49, 1);
      expect(y).toBeCloseTo(111325.14, 1);
    });

    it('populates the featureFields values', () => {
      const l = layer(['category']);

      featureFormats.wkt(l, [
        [1, 'POINT(0 0)', 'city'],
        [2, 'POINT(1 1)', 'office'],
      ]);

      expect(l.featureFields.category.values).toEqual(['city', 'office']);
      expect(l.featureFields.id).toBeUndefined();
    });

    it('does not duplicate the id field', () => {
      const l = layer(['id', 'name']);

      const [feature] = featureFormats.wkt(l, [[7, 'POINT(0 0)', 'Seven']]);

      expect(feature.get('id')).toBe(7);
      expect(feature.get('name')).toBe('Seven');
      expect(l.featureFields.id.values).toEqual([7]);
    });

    it('returns undefined if the features are not an array', () => {
      expect(featureFormats.wkt(layer(), null)).toBeUndefined();
    });

    it('processes the featureFields', () => {
      const l = layer(['size']);
      l.style.icon_scaling = { field: 'size' };

      featureFormats.wkt(l, [
        [1, 'POINT(0 0)', 4],
        [2, 'POINT(1 1)', 9],
      ]);

      expect(l.style.icon_scaling.max).toBe(9);
    });
  });

  describe('geojson', () => {
    it('creates features from geojson geometries and properties', () => {
      const l = layer(['name']);

      const features = featureFormats.geojson(l, [
        {
          id: 3,
          geometry: { type: 'Point', coordinates: [1, 1] },
          properties: { name: 'Three', other: true },
        },
      ]);

      expect(features[0].get('id')).toBe(3);
      expect(features[0].get('name')).toBe('Three');
      expect(features[0].get('other')).toBe(true);

      const [x, y] = features[0].getGeometry().getCoordinates();
      expect(x).toBeCloseTo(111319.49, 1);
      expect(y).toBeCloseTo(111325.14, 1);

      expect(l.featureFields.name.values).toEqual(['Three']);
    });
  });

  describe('cluster', () => {
    it('creates point features with count, id and field properties', () => {
      const l = layer(['label']);
      l.cluster = {};

      const features = featureFormats.cluster(l, [
        [[10, 20], 1, 5, 'single'],
        [[30, 40], 4, [6, 7, 8, 9], 'many'],
        [[50, 60], 2, [1, 2], 'pair'],
      ]);

      expect(features.map((f) => f.get('count'))).toEqual([1, 4, 2]);
      expect(features[0].get('id')).toBe(5);
      expect(features[1].get('label')).toBe('many');
      expect(features[2].getGeometry().getCoordinates()).toEqual([50, 60]);
      expect(l.cluster.max_size).toBe(4);
    });
  });

  describe('wkt_properties', () => {
    it('assigns the feature properties to the layer featuresObject', () => {
      const l = layer(['category', 'name']);
      l.featuresObject = {};

      featureFormats.wkt_properties(l, [
        [1, 'city', 'Paris'],
        [2, 'office', 'Geolytix'],
      ]);

      expect(l.featuresObject).toEqual({
        1: { id: 1, category: 'city', name: 'Paris' },
        2: { id: 2, category: 'office', name: 'Geolytix' },
      });

      expect(l.featureFields.category.values).toEqual(['city', 'office']);
    });
  });

  describe('wkth3', () => {
    // A fake h3-js module which returns a triangle boundary of lat/lng pairs.
    const h3js = {
      cellToBoundary: vi.fn(() => [
        [0, 0],
        [0, 1],
        [1, 1],
      ]),
    };

    it('creates polygon features from h3 cell ids', async () => {
      vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(h3js);

      const l = layer(['value']);

      const features = await featureFormats.wkth3(l, [
        ['wkth3-test-a', 10],
        ['wkth3-test-b', 20],
      ]);

      expect(features).toHaveLength(2);
      expect(features[0].get('id')).toBe('wkth3-test-a');
      expect(features[1].get('value')).toBe(20);
      expect(features[0].getGeometry().getType()).toBe('Polygon');

      // The ring is closed with the first coordinate.
      const ring = features[0].getGeometry().getCoordinates()[0];
      expect(ring).toHaveLength(4);
      expect(ring[0]).toEqual(ring[3]);

      expect(l.featureFields.value.values).toEqual([10, 20]);
    });

    it('reuses the geometry of a cell id', async () => {
      vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(h3js);

      h3js.cellToBoundary.mockClear();

      const [a] = await featureFormats.wkth3(layer(), [['wkth3-test-c']]);
      const [b] = await featureFormats.wkth3(layer(), [['wkth3-test-c']]);

      expect(h3js.cellToBoundary).toHaveBeenCalledOnce();
      expect(b.getGeometry()).toBe(a.getGeometry());
    });

    it('returns an empty array if h3-js fails to load', async () => {
      vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(new Error('offline'));

      expect(await featureFormats.wkth3(layer(), [['x']])).toEqual([]);
    });

    it('returns undefined if the features are not an array', async () => {
      vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue(h3js);

      expect(await featureFormats.wkth3(layer(), null)).toBeUndefined();
    });
  });
});
