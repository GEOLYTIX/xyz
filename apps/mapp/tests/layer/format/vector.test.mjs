import { describe, expect, it, vi } from 'vitest';
import { addLayers, createMapview, getLocale } from '../../helpers.mjs';

describe('vector cluster', () => {
  it('clusters the grocery retail points in the viewport', async () => {
    const locale = await getLocale('grocery');

    const mapview = await createMapview(locale, locale.view);

    await addLayers(mapview);

    const layer = mapview.layers.retail_points;

    expect(layer.L.getSource()).toBeInstanceOf(ol.source.Cluster);

    const clusters = layer.cluster.source.getFeatures();

    const count = clusters.reduce((n, F) => n + F.get('features').length, 0);

    // Every source feature is in one cluster.
    expect(count).toBe(layer.source.getFeatures().length);
    expect(clusters.length).toBeLessThan(count);
    expect(layer.cluster.max_size).toBeGreaterThan(1);
  });

  // V8 throws a RangeError for a spread of more than ~125k arguments into Math.max.
  it('assigns the max_size for more cluster features than the spread limit', async () => {
    const locale = await getLocale('grocery');

    const mapview = await createMapview(locale, locale.view);

    await addLayers(mapview);

    const layer = mapview.layers.retail_points;

    // At a small resolution every point is its own cluster.
    layer.cluster.source.resolution = 0.001;

    const features = [];

    for (let i = 0; i < 130000; i++) {
      features.push(
        new ol.Feature({
          geometry: new ol.geom.Point([
            (i % 400) * 100,
            Math.floor(i / 400) * 100,
          ]),
          id: i,
          retailer: 'Aldi',
        }),
      );
    }

    // A second feature at the first coordinate makes the largest cluster.
    features.push(
      new ol.Feature({
        geometry: new ol.geom.Point([0, 0]),
        id: 130000,
        retailer: 'Aldi',
      }),
    );

    layer.source.clear(true);

    // Adding the features refreshes the cluster source.
    expect(() => layer.source.addFeatures(features)).not.toThrow();

    expect(layer.cluster.source.getFeatures().length).toBe(130000);
    expect(layer.cluster.max_size).toBe(2);
  });

  it('ignores an empty cluster feature for the max_size', async () => {
    const locale = await getLocale('grocery');

    const mapview = await createMapview(locale, locale.view);

    await addLayers(mapview);

    const layer = mapview.layers.retail_points;

    const max_size = layer.cluster.max_size;

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    layer.cluster.source.addFeature(new ol.Feature({ features: [] }));

    expect(error).toHaveBeenCalledWith('Empty cluster feature detected.');
    expect(layer.cluster.max_size).toBe(max_size);
  });
});
