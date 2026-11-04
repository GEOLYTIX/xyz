import { describe, expect, it } from 'vitest';
import {
  addLayers,
  createMapview,
  getLocale,
  sourceFeatures,
} from './helpers.mjs';

describe('Smoke', () => {
  it('loads Openlayers and the MAPP library', () => {
    expect(ol.util.VERSION).toBeTruthy();
    expect(mapp.version).toBeTruthy();
    expect(mapp.host).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  });

  it('requests a locale from the testhost', async () => {
    const locale = await getLocale('smoke');

    expect(locale.key).toBe('smoke');
    expect(locale.layers.map((layer) => layer.key)).toEqual([
      'locations',
      'features',
    ]);
  });

  it('renders wkt layers with the devdb rows', async () => {
    const locale = await getLocale('smoke');

    const mapview = await createMapview(locale, { lat: 48, lng: 5, z: 4 });

    await addLayers(mapview);

    const locations = sourceFeatures(mapview.layers.locations);

    expect(locations.map((feature) => feature.get('id'))).toEqual([1, 2, 3, 4]);

    // The row with a null geometry is not a feature.
    const features = sourceFeatures(mapview.layers.features);

    expect(features.map((feature) => feature.get('id'))).toEqual([1, 2, 3, 5]);

    expect(features.map((feature) => feature.getGeometry().getType())).toEqual([
      'LineString',
      'Polygon',
      'Point',
      'Point',
    ]);
  });
});
