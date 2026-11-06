import { describe, expect, it } from 'vitest';
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
});
