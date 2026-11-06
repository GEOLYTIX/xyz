import { describe, expect, it, vi } from 'vitest';
import { polygonIntersectFeatures } from '../../lib/utils/polygonIntersectFeatures.mjs';

const ring = (x, y, size) => [
  [x, y],
  [x + size, y],
  [x + size, y + size],
  [x, y + size],
  [x, y],
];

// The drawn polygon.
const polygon = new ol.geom.Polygon([ring(0, 0, 10)]);

const features = {
  pointInside: new ol.Feature(new ol.geom.Point([5, 5])),
  pointOutside: new ol.Feature(new ol.geom.Point([20, 20])),
  lineCrossing: new ol.Feature(
    new ol.geom.LineString([
      [-5, 5],
      [5, 5],
    ]),
  ),
  polygonOutside: new ol.Feature(new ol.geom.Polygon([ring(20, 20, 10)])),
  multiPolygonInside: new ol.Feature(
    new ol.geom.MultiPolygon([[ring(2, 2, 1)], [ring(30, 30, 1)]]),
  ),
};

function mockMapview() {
  const source = new ol.source.Vector({ features: Object.values(features) });

  return {
    interaction: { snap: { source } },
    interactions: { draw: vi.fn() },
  };
}

describe('utils/polygonIntersectFeatures', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.polygonIntersectFeatures).toBe(polygonIntersectFeatures);
  });

  it('returns without a mapview', () => {
    expect(polygonIntersectFeatures({})).toBeUndefined();
  });

  it('starts a polygon draw interaction with the params', () => {
    const mapview = mockMapview();

    polygonIntersectFeatures({ mapview, tooltip: 'area' });

    const interaction = mapview.interactions.draw.mock.calls[0][0];

    expect(interaction.type).toBe('Polygon');
    expect(interaction.tooltip).toBe('area');
    expect(interaction.drawend).toBeTypeOf('function');
  });

  function drawPolygon() {
    const mapview = mockMapview();

    const drawendCallback = vi.fn();

    polygonIntersectFeatures({ mapview, drawendCallback });

    const interaction = mapview.interactions.draw.mock.calls[0][0];

    interaction.drawend({ feature: new ol.Feature(polygon) });

    expect(drawendCallback).toHaveBeenCalledOnce();

    return drawendCallback.mock.calls[0][0];
  }

  it('passes the line and polygon features with a vertex in the polygon to the drawendCallback', () => {
    const intersecting = drawPolygon();

    expect(intersecting).toContain(features.lineCrossing);
    expect(intersecting).toContain(features.multiPolygonInside);
    expect(intersecting).not.toContain(features.polygonOutside);
    expect(intersecting).not.toContain(features.pointOutside);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3043: the coordinates [x, y] of a Point are iterated as numbers, so point features never intersect the polygon.
  it.fails(
    'passes point features in the polygon to the drawendCallback',
    () => {
      expect(drawPolygon()).toContain(features.pointInside);
    },
  );

  it('completes the drawend without a drawendCallback', () => {
    const mapview = mockMapview();

    polygonIntersectFeatures({ mapview });

    const interaction = mapview.interactions.draw.mock.calls[0][0];

    expect(() =>
      interaction.drawend({ feature: new ol.Feature(polygon) }),
    ).not.toThrow();
  });
});
