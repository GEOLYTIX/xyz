import { describe, expect, it, vi } from 'vitest';
import {
  addLayers,
  changeEnd,
  createMapview,
  getLocale,
} from '../../helpers.mjs';

/**
The countries locale has the countries mvt layer with the naturalearth.countries table. The testhost encodes the vector tiles, because the devdb PostGIS can't create vector tiles with ST_AsMVT.

The config is assigned to the countries layer before the layer is decorated, eg. `{ wkt_properties: true }`. The testhost workspace layer is unchanged.
*/
async function countries(view, config) {
  const locale = await getLocale('countries');

  const layer = locale.layers.find((layer) => layer.key === 'countries');

  Object.assign(layer, config);

  const mapview = await createMapview(locale, view || locale.view);

  await addLayers(mapview);

  return mapview.layers.countries;
}

/**
Returns the rendered features of the vector tile layer in the view extent.
*/
function features(layer) {
  const extent = layer.mapview.Map.getView().calculateExtent();

  return layer.L.getFeaturesInExtent(extent);
}

function names(layer) {
  return [...new Set(features(layer).map((F) => F.get('name')))];
}

function featureAt(layer, lonLat) {
  const coordinate = ol.proj.fromLonLat(lonLat);

  return features(layer).filter((F) =>
    ol.extent.containsCoordinate(F.getExtent(), coordinate),
  );
}

/**
Resolves on the next rendercomplete event of the mapview.Map, eg. after a layer reload.
*/
function rendered(layer) {
  return new Promise((resolve) =>
    layer.mapview.Map.once('rendercomplete', resolve),
  );
}

describe('mvt', () => {
  it('creates a vector tile layer', async () => {
    const layer = await countries();

    expect(layer.L).toBeInstanceOf(ol.layer.VectorTile);
    expect(layer.L.getClassName()).toBe('mapp-layer-countries');
    expect(layer.source).toBeInstanceOf(ol.source.VectorTile);
    expect(layer.featureSource).toBeInstanceOf(ol.source.VectorTile);
    expect(typeof layer.reload).toBe('function');
  });

  it('renders the countries in the view from the vector tiles', async () => {
    const layer = await countries();

    const countryNames = names(layer);

    expect(countryNames).toContain('Germany');
    expect(countryNames).toContain('France');
    expect(countryNames).not.toContain('Australia');
  });

  it('places the feature geometries in the tiles', async () => {
    const layer = await countries();

    // The extent of a feature in a tile is the clipped country geometry.
    expect(featureAt(layer, [13.4, 52.52]).map((F) => F.get('name'))).toContain(
      'Germany',
    );

    expect(featureAt(layer, [-3.7, 40.42]).map((F) => F.get('name'))).toContain(
      'Spain',
    );
  });

  it('has the qID and the theme field as feature properties', async () => {
    const layer = await countries();

    const [germany] = features(layer).filter(
      (F) => F.get('name') === 'Germany',
    );

    // The name is requested as the hover field.
    expect(germany.get('continent')).toBe('Europe');
    expect(typeof germany.get('id')).toBe('number');
  });

  it('requests the tiles with the layer params', async () => {
    const layer = await countries();

    const url = new URL(layer.source.getTileUrlFunction()([3, 4, 2]));

    expect(url.pathname).toBe('/api/query');
    expect(Object.fromEntries(url.searchParams)).toMatchObject({
      template: 'mvt',
      layer: 'countries',
      locale: 'countries',
      table: 'naturalearth.countries',
      geom: 'geom_3857',
      z: '3',
      x: '4',
      y: '2',
    });

    expect(url.searchParams.get('fields').split(',')).toEqual(
      expect.arrayContaining(['continent', 'name']),
    );
    expect(url.searchParams.has('viewport')).toBe(false);
  });

  it('does not request tiles for a hidden layer', async () => {
    const layer = await countries();

    layer.hide();

    expect(layer.source.getTileUrlFunction()([3, 4, 2])).toBeUndefined();
  });

  it('does not request tiles without a table for the zoom level', async () => {
    const layer = await countries();

    vi.spyOn(layer, 'tableCurrent').mockReturnValue(undefined);

    expect(layer.source.getTileUrlFunction()([3, 4, 2])).toBeUndefined();
  });

  it('reloads the tiles with the layer filter', async () => {
    const layer = await countries();

    expect(names(layer)).toContain('Morocco');

    layer.filter.current = { continent: { in: ['Europe'] } };

    const reloaded = rendered(layer);

    layer.reload();

    await reloaded;

    const countryNames = names(layer);

    expect(countryNames).toContain('Germany');
    expect(countryNames).not.toContain('Morocco');
    expect(features(layer).every((F) => F.get('continent') === 'Europe')).toBe(
      true,
    );
  });

  it('renders an empty tile without features', async () => {
    // The north pole has no countries in the 1:110m data.
    const layer = await countries({ lat: 85, lng: -170, z: 6 });

    expect(features(layer)).toEqual([]);
  });

  it('warns and does not create a layer without srid 3857', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const layer = { key: 'mvt_4326', srid: '4326' };

    mapp.layer.formats.mvt(layer);

    expect(warn).toHaveBeenCalledWith(
      'Layer mvt_4326 must be set to use SRID 3857.',
    );
    expect(layer.L).toBeUndefined();

    warn.mockRestore();
  });

  it('warns about the disabled mvt_cache', async () => {
    const locale = await getLocale('countries');

    const mapview = await createMapview(locale, locale.view);

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const layer = { ...locale.layers[1], mvt_cache: true, mapview };

    mapp.layer.formats.mvt(layer);

    expect(warn).toHaveBeenCalledWith(
      'Layer countries mvt_cache has been disabled.',
    );

    warn.mockRestore();
  });
});

// The naturalearth.countries ids.
const GERMANY = 122;
const FRANCE = 44;
const AUSTRALIA = 138;
const MOROCCO = 163;

/**
Calls the layer style function for a feature with the country id. The featureStyle method assigns the feature properties from the layer featuresObject or featureLookup.
*/
function style(layer, id) {
  const feature = new ol.Feature({ id });

  return { style: layer.L.getStyleFunction()(feature), feature };
}

/**
Resolves once the debounced wkt_properties request has assigned the properties of the feature to the layer featuresObject.
*/
async function properties(layer, id) {
  await expect
    .poll(() => layer.featuresObject?.[id], { timeout: 5000 })
    .toBeDefined();

  return layer.featuresObject[id];
}

describe('mvt wkt_properties', () => {
  it('requests the tile geometries without fields', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    const url = new URL(layer.source.getTileUrlFunction()([3, 4, 2]));

    expect(url.searchParams.get('template')).toBe('mvt');
    expect(url.searchParams.get('srid')).toBe('3857');
    expect(url.searchParams.has('fields')).toBe(false);
    expect(url.searchParams.has('filter')).toBe(false);
  });

  it('loads the feature properties for the viewport', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    expect(await properties(layer, GERMANY)).toEqual({
      id: GERMANY,
      continent: 'Europe',
      name: 'Germany',
    });

    // Australia is not in the viewport.
    expect(layer.featuresObject[AUSTRALIA]).toBeUndefined();

    // The featureFields are processed from the properties.
    expect(layer.featureFields.continent.values).toContain('Europe');
    expect(layer.changeEndCallbacks).toHaveLength(1);
  });

  it('only styles features with properties', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, GERMANY);

    const germany = style(layer, GERMANY);

    expect(germany.style).toBeTruthy();
    expect(germany.feature.properties.continent).toBe('Europe');
    expect(germany.feature.style.fillColor).toBe('#4363d8');

    expect(style(layer, AUSTRALIA).style).toBeNull();
  });

  it('loads the properties for the viewport after the map view changes', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, GERMANY);

    const changed = changeEnd(layer.mapview);

    layer.mapview.Map.getView().setCenter(ol.proj.fromLonLat([134, -25]));

    await changed;

    expect((await properties(layer, AUSTRALIA)).continent).toBe('Oceania');
  });

  it('loads the properties with the layer filter on reload', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, MOROCCO);

    layer.filter.current = { continent: { in: ['Europe'] } };

    layer.reload();

    await expect
      .poll(() => layer.featuresObject[MOROCCO], { timeout: 5000 })
      .toBeUndefined();

    expect(layer.featuresObject[GERMANY]).toBeDefined();
    expect(style(layer, MOROCCO).style).toBeNull();
  });

  it('refreshes the tiles on reload for a feature which has not been rendered', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, FRANCE);

    const refresh = vi.spyOn(layer.source, 'refresh');

    // France has not been rendered before, eg. after a location has been created.
    delete layer.featuresObject[FRANCE];

    layer.reload();

    await expect
      .poll(() => refresh.mock.calls.length, { timeout: 5000 })
      .toBe(1);

    expect(layer.featuresObject[FRANCE]).toBeDefined();
  });

  it('does not refresh the tiles on reload without a new feature', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, FRANCE);

    const refresh = vi.spyOn(layer.source, 'refresh');
    const changed = vi.spyOn(layer.L, 'changed');

    layer.reload();

    // The properties are assigned and the layer is restyled.
    await expect
      .poll(() => changed.mock.calls.length, { timeout: 5000 })
      .toBe(1);

    expect(refresh).not.toHaveBeenCalled();
  });

  it('clears the tile source of a hidden layer', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, GERMANY);

    const clear = vi.spyOn(layer.source, 'clear');

    layer.display = false;

    layer.reload();

    expect(clear).toHaveBeenCalled();
  });
});

describe('mvt featureLookup', () => {
  const featureLookup = [
    { id: GERMANY, value: 'de' },
    { id: FRANCE, value: 'fr' },
  ];

  it('requests the tile geometries without fields', async () => {
    const layer = await countries(undefined, { featureLookup });

    const url = new URL(layer.source.getTileUrlFunction()([3, 4, 2]));

    expect(url.searchParams.get('template')).toBe('mvt');
    expect(url.searchParams.has('fields')).toBe(false);
  });

  it('only styles features in the lookup with the lookup properties', async () => {
    const layer = await countries(undefined, { featureLookup });

    const germany = style(layer, GERMANY);

    expect(germany.style).toBeTruthy();
    expect(germany.feature.properties.value).toBe('de');

    expect(style(layer, MOROCCO).style).toBeNull();
  });

  it('looks up features by the featureLookupId', async () => {
    const layer = await countries(undefined, {
      featureLookup: [{ country: FRANCE, value: 'fr' }],
      featureLookupId: 'country',
    });

    const france = style(layer, FRANCE);

    expect(france.style).toBeTruthy();
    expect(france.feature.properties.value).toBe('fr');

    expect(style(layer, GERMANY).style).toBeNull();
  });

  it('returns the extent of the lookup features', async () => {
    const layer = await countries(undefined, {
      featureLookup: [{ id: GERMANY }],
    });

    const extent = await layer.getExtent();

    expect(
      ol.extent.containsCoordinate(extent, ol.proj.fromLonLat([13.4, 52.52])),
    ).toBe(true);

    // The extent of Germany doesn't contain Paris.
    expect(
      ol.extent.containsCoordinate(extent, ol.proj.fromLonLat([2.35, 48.86])),
    ).toBe(false);
  });
});
