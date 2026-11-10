import { describe, expect, it } from 'vitest';
import verticeGeoms from '../../lib/utils/verticeGeoms.mjs';

const square = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 0],
];

const shifted = square.map(([x, y]) => [x + 5, y]);

const feature = (geometry) => new ol.Feature({ geometry });

describe('utils/verticeGeoms', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.verticeGeoms).toBe(verticeGeoms);
  });

  it.each([
    ['Point', () => new ol.geom.Point([1, 2]), 'Point', [1, 2]],
    [
      'LineString',
      () =>
        new ol.geom.LineString([
          [0, 0],
          [1, 1],
        ]),
      'MultiPoint',
      [
        [0, 0],
        [1, 1],
      ],
    ],
    ['MultiPoint', () => new ol.geom.MultiPoint(square), 'MultiPoint', square],
    [
      'MultiLineString',
      () => new ol.geom.MultiLineString([square, shifted]),
      'MultiPoint',
      [...square, ...shifted],
    ],
    ['Polygon', () => new ol.geom.Polygon([square]), 'MultiPoint', square],
    [
      'Polygon with an interior ring',
      () => new ol.geom.Polygon([square, shifted]),
      'MultiPoint',
      [...square, ...shifted],
    ],
    [
      'MultiPolygon',
      () => new ol.geom.MultiPolygon([[square], [shifted]]),
      'MultiPoint',
      [...square, ...shifted],
    ],
  ])('returns the vertices of a %s', (_type, geometry, type, coordinates) => {
    const vertices = verticeGeoms(feature(geometry()));

    expect(vertices.getType()).toBe(type);
    expect(vertices.getCoordinates()).toEqual(coordinates);
  });

  it('returns a new Point geometry', () => {
    const point = new ol.geom.Point([1, 2]);

    expect(verticeGeoms(feature(point))).not.toBe(point);
  });
});
