import { describe, expect, it, vi } from 'vitest';
import { createMapview, getLocale } from '../helpers.mjs';

async function mapview() {
  const locale = await getLocale('smoke');

  return createMapview(locale, { lat: 51.5, lng: -0.1, z: 10 });
}

const POINT = { type: 'Point', coordinates: [-0.1, 51.5] };

function features(L) {
  return L.getSource().getFeatures();
}

describe('mapview geoJSON', () => {
  it('adds a vector layer with the GeoJSON geometry', async () => {
    const view = await mapview();

    const L = view.geoJSON({ value: POINT, srid: '4326', zIndex: 5 });

    expect(L).toBeInstanceOf(ol.layer.Vector);
    expect(view.Map.getLayers().getArray()).toContain(L);
    expect(L.getZIndex()).toBe(5);

    const [feature] = features(L);

    // The geometry is transformed from the srid to the mapview srid.
    const coords = feature.getGeometry().getCoordinates();

    ol.proj
      .fromLonLat(POINT.coordinates)
      .forEach((coord, i) => expect(coords[i]).toBeCloseTo(coord, 3));
  });

  it('parses a GeoJSON string value', async () => {
    const view = await mapview();

    const L = view.geoJSON({ value: JSON.stringify(POINT), srid: '4326' });

    expect(features(L)[0].getGeometry().getType()).toBe('Point');
  });

  it('reads the geometry in the mapview srid without a srid', async () => {
    const view = await mapview();

    const L = view.geoJSON({
      geometry: { type: 'Point', coordinates: [-11132, 6710219] },
    });

    expect(features(L)[0].getGeometry().getCoordinates()).toEqual([
      -11132, 6710219,
    ]);
  });

  it('prefers the dataProjection over the srid', async () => {
    const view = await mapview();

    const L = view.geoJSON({
      value: POINT,
      srid: '3857',
      dataProjection: '4326',
    });

    expect(features(L)[0].getGeometry().getCoordinates()[1]).toBeCloseTo(
      ol.proj.fromLonLat(POINT.coordinates)[1],
      3,
    );
  });

  it('assigns a style function from the style config', async () => {
    const view = await mapview();

    const params = {
      value: POINT,
      srid: '4326',
      style: { icon: { type: 'dot', fillColor: '#f00' } },
    };

    const L = view.geoJSON(params);

    expect(typeof params.Style).toBe('object');
    expect(L.getStyle()).toBe(params.Style);
  });

  it('does not add a layer without a geometry', async () => {
    const view = await mapview();

    const layers = view.Map.getLayers().getLength();

    expect(view.geoJSON({ value: null })).toBeUndefined();
    expect(view.Map.getLayers().getLength()).toBe(layers);
  });

  it('logs an error for an invalid geometry', async () => {
    const view = await mapview();

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(
      view.geoJSON({ value: { type: 'Unsupported', coordinates: [] } }),
    ).toBeUndefined();

    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });
});

describe('mapview geometry', () => {
  it('reads the geometry with the format param', async () => {
    const view = await mapview();

    const L = view.geometry({
      format: 'GeoJSON',
      value: {
        type: 'LineString',
        coordinates: [
          [-0.2, 51.5],
          [-0.1, 51.5],
        ],
      },
      srid: '4326',
    });

    expect(features(L)[0].getGeometry().getType()).toBe('LineString');
  });

  it.each([
    ['without a format', undefined],
    ['with a format which is not an Openlayers format', 'Bogus'],
  ])('reads a GeoJSON geometry %s', async (_, format) => {
    const view = await mapview();

    const L = view.geometry({ format, value: POINT, srid: '4326' });

    expect(features(L)[0].getGeometry().getType()).toBe('Point');
  });

  it('does not reuse the format of a previous call', async () => {
    const view = await mapview();

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    // The WKT format can't read a GeoJSON geometry.
    expect(
      view.geometry({ format: 'WKT', value: POINT, srid: '4326' }),
    ).toBeUndefined();

    expect(error).toHaveBeenCalled();

    expect(view.geometry({ value: POINT, srid: '4326' })).toBeInstanceOf(
      ol.layer.Vector,
    );

    error.mockRestore();
  });
});
