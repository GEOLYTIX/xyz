import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  addLayers,
  changeEnd,
  createMapview,
  createPolygon,
  drawPolygon,
  getLocale,
  getRecord,
  panTo,
  renameLocation,
  render,
  resetTable,
  scratchPolygonLayer,
  tableRows,
  themeColours,
  themeStyles,
  themeValues,
  trashLocation,
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

  // The XYZ API accepts the template as path param and as query param. The testhost must encode the tiles of both URL forms.
  it('receives a vector tile with the template as path or query param', async () => {
    const params =
      'locale=countries&layer=countries&table=naturalearth.countries&geom=geom_3857&z=3&x=4&y=2';

    const tiles = await Promise.all(
      [
        `${mapp.host}/api/query?template=mvt&${params}`,
        `${mapp.host}/api/query/mvt?${params}`,
      ].map(async (url) => {
        const response = await fetch(url);

        expect(response.status).toBe(200);
        expect(response.headers.get('Content-Type')).toBe(
          'application/x-protobuf',
        );

        const features = new ol.format.MVT().readFeatures(
          await response.arrayBuffer(),
        );

        return features.map((F) => F.get('id')).sort((a, b) => a - b);
      }),
    );

    expect(tiles[0].length).toBeGreaterThan(0);
    expect(tiles[1]).toEqual(tiles[0]);
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

/**
Stops the debounced mapview changeEnd of the initial view and resolves once the properties requests of the initial view have settled.

A load from the changeEnd after the layer.reload() would supersede the debounced reload request and check the pending reload in its place. The tests call the changeEnd load themselves where this order is tested.

A properties request from the changeEnd may also be debounced or in flight when the test calls the layer.reload(). Its response would assign the properties before the response of the reload request. The final load supersedes a debounced request, and is sent after a request in flight, so no response of the initial view is pending once the load has resolved.
*/
async function stopChangeEnd(layer) {
  clearTimeout(layer.mapview.changeEndTimer);

  const [load] = layer.changeEndCallbacks;

  layer.changeEndCallbacks.length = 0;

  await load(layer);
}

/**
Resolves as soon as the next XMLHttpRequest has been sent, before its response can be received. A debounced mapp.utils.xhr request is sent from a timeout.
*/
function requestSent() {
  return new Promise((resolve) => {
    const send = vi
      .spyOn(XMLHttpRequest.prototype, 'send')
      .mockImplementation(function (body) {
        send.mockRestore();

        this.send(body);

        resolve();
      });
  });
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

    await stopChangeEnd(layer);

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

    await stopChangeEnd(layer);

    const refresh = vi.spyOn(layer.source, 'refresh');

    // France has not been rendered before, eg. after a location has been created.
    delete layer.featuresObject[FRANCE];

    layer.reload();

    await expect
      .poll(() => refresh.mock.calls.length, { timeout: 5000 })
      .toBe(1);

    expect(layer.featuresObject[FRANCE]).toBeDefined();
  });

  // The layer.reload() is called for a feature which has not been rendered, eg. after a location has been created. The reload is pending with the layer.reloadFeatureIds until a response has checked it. The two tests below cover a load from a mapview changeEnd which takes the place of the reload.
  it('refreshes the tiles if a changeEnd load supersedes the debounced reload request', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, FRANCE);

    const [load] = layer.changeEndCallbacks;

    await stopChangeEnd(layer);

    const refresh = vi.spyOn(layer.source, 'refresh');

    // France has not been rendered before.
    delete layer.featuresObject[FRANCE];

    // The reload request is debounced by 500ms.
    layer.reload();

    // The map view changes before the reload request has been sent. The changeEnd load has the same debounce key and supersedes the reload request.
    await load(layer);

    // The changeEnd response has assigned the properties of the new feature.
    expect(layer.featuresObject[FRANCE]).toBeDefined();

    // The reload request was never sent. The changeEnd response has checked the pending reload and refreshed the tiles for the geometry of the new feature.
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes the tiles if a changeEnd response assigns the new feature before the reload response', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, FRANCE);

    const [load] = layer.changeEndCallbacks;

    await stopChangeEnd(layer);

    const refresh = vi.spyOn(layer.source, 'refresh');

    // The map view changes. The changeEnd request is sent after the debounce.
    const sent = requestSent();

    const changeEndLoad = load(layer);

    await sent;

    // France has not been rendered before. The changeEnd request is in flight when the layer is reloaded.
    delete layer.featuresObject[FRANCE];

    layer.reload();

    // The changeEnd response assigns the properties of the new feature. The load was called before the reload and does not check the pending reload.
    await changeEndLoad;

    expect(layer.featuresObject[FRANCE]).toBeDefined();
    expect(refresh).not.toHaveBeenCalled();

    // The new feature is already in the featuresObject when the reload response is received. The feature has not been rendered before the reload, and the tiles with the geometry of the new feature must be requested.
    await expect
      .poll(() => refresh.mock.calls.length, { timeout: 5000 })
      .toBe(1);
  });

  it('does not refresh the tiles on reload without a new feature', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, FRANCE);

    await stopChangeEnd(layer);

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

    await stopChangeEnd(layer);

    const clear = vi.spyOn(layer.source, 'clear');

    layer.display = false;

    layer.reload();

    expect(clear).toHaveBeenCalled();

    // The cleared tile source requests the tile geometries itself once the layer is shown. The reload is not pending.
    expect(layer.reloadFeatureIds).toBeUndefined();
  });

  it('keeps the reload pending if the properties request fails', async () => {
    const layer = await countries(undefined, { wkt_properties: true });

    await properties(layer, FRANCE);

    const [load] = layer.changeEndCallbacks;

    await stopChangeEnd(layer);

    // The tiles are not requested again from the testhost.
    const refresh = vi
      .spyOn(layer.source, 'refresh')
      .mockImplementation(() => {});

    vi.spyOn(layer.source, 'clear').mockImplementation(() => {});
    vi.spyOn(layer.featureSource, 'refresh').mockImplementation(() => {});

    // France has not been rendered before.
    delete layer.featuresObject[FRANCE];

    // The mapp.utils.xhr method resolves with an Error for a failed request.
    const xhr = vi
      .spyOn(mapp.utils, 'xhr')
      .mockResolvedValueOnce(new Error('HTTP 500'));

    layer.reload();

    // The failed response assigns an empty featuresObject.
    await expect
      .poll(() => Object.keys(layer.featuresObject).length, { timeout: 5000 })
      .toBe(0);

    xhr.mockRestore();

    // The failed response has not checked the reload.
    expect(layer.reloadFeatureIds).toBeInstanceOf(Set);
    expect(refresh).not.toHaveBeenCalled();

    // The next response checks the pending reload and refreshes the tiles for the new feature.
    await load(layer);

    expect(layer.featuresObject[FRANCE]).toBeDefined();
    expect(layer.reloadFeatureIds).toBeUndefined();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

// The scratch_polygon polygon which is created, renamed and deleted by the tests.
const ADDED = 'Added';
const RENAMED = 'Renamed';
const ADDED_EXTENT = [15000, 6690000, 25000, 6700000];

// The centre of the scratch locale view, and a centre without scratch polygons in the view.
const LONDON = ol.proj.fromLonLat([-0.1, 51.5]);
const AWAY = ol.proj.fromLonLat([5, 51.5]);

/**
Review of #3079: an mvt layer with wkt_properties and a distributed theme. The legend and the colours are not updated after a polygon has been created or deleted.

The tests run in order and depend on each other. The add test creates a polygon with the mapp.location.create method, the rename test updates its name with the location.update() method, and the delete test deletes the same polygon with the location.trash() method. The table is reset to the rows before the tests once in the afterAll hook, also if a test fails.

The seeded polygons must keep their colours throughout.
*/
describe.sequential('mvt wkt_properties distributed theme', () => {
  let colours;
  let dispose;
  let layer;
  let location;
  let seeded;

  beforeAll(async () => {
    ({ dispose, layer } = await scratchPolygonLayer());

    seeded = await tableRows(layer);
  });

  afterAll(async () => {
    try {
      // The created polygon is deleted with the location_delete query if a test has failed before the delete.
      expect(await resetTable(layer, seeded)).toEqual(seeded);
    } finally {
      // The trash method has already removed the location and its remove method.
      location?.remove?.();

      dispose();
    }
  });

  /**
  Asserts that every rendered polygon has the colour of its category in the lookup, and that the seeded polygons have the colours of the first render.
  */
  function expectColours() {
    for (const s of themeStyles(layer)) {
      expect(s.fillColor, s.name).toBe(s.lookup);
    }

    expect(themeColours(layer)).toMatchObject(colours);
  }

  it('renders the seeded polygons with the categories of the theme lookup', async () => {
    expect(seeded.map(([, name]) => name)).toEqual([
      'North',
      'East',
      'South',
      'West',
    ]);

    await expect
      .poll(
        // A polygon in more than one tile is rendered once for each tile.
        () =>
          [
            ...new Set(
              themeStyles(layer)
                .filter((s) => s.fillColor && s.fillColor === s.lookup)
                .map((s) => s.name),
            ),
          ].sort(),
        { timeout: 5000 },
      )
      .toEqual(['East', 'North', 'South', 'West']);

    colours = themeColours(layer);

    // The seeded polygons have different categories.
    expect(new Set(Object.values(colours)).size).toBe(4);
  });

  it('assigns a category to a polygon created with the location create method', async () => {
    location = await createPolygon(layer, ADDED, ADDED_EXTENT);

    const id = Number(location.id);

    expect(seeded.map(([id]) => id)).not.toContain(id);

    // The create method reloads the layer. The tiles must be refreshed for the geometry of the new polygon.
    await expect
      .poll(() => themeStyles(layer).find((s) => s.id === id)?.fillColor, {
        timeout: 10000,
      })
      .toBeDefined();

    const theme = layer.style.theme;

    expect(Object.keys(theme.lookup)).toContain(ADDED);
    expect(themeValues(layer)).toContain(ADDED);

    // The new polygon has a category colour.
    expect(theme.categories.map((cat) => cat.style.fillColor)).toContain(
      themeStyles(layer).find((s) => s.id === id).fillColor,
    );

    // The create method checks the loaded tiles for the new feature after a second and reloads the layer again if the feature has not been found.
    await new Promise((resolve) => setTimeout(resolve, 1500));

    await render(layer);

    expectColours();

    expect(themeStyles(layer).map((s) => s.name)).toContain(ADDED);
  }, 20000);

  it('replaces the value of a polygon renamed with the location update method', async () => {
    expect(location).toBeDefined();

    const id = Number(location.id);

    await renameLocation(location, RENAMED);

    // The update method reloads the layer.
    await expect
      .poll(() => layer.featuresObject?.[id]?.name, { timeout: 5000 })
      .toBe(RENAMED);

    await render(layer);

    expect(Object.keys(layer.style.theme.lookup)).not.toContain(ADDED);
    expect(Object.keys(layer.style.theme.lookup)).toContain(RENAMED);

    // The number of values is unchanged.
    expect(themeValues(layer).sort()).toEqual([
      'East',
      'North',
      RENAMED,
      'South',
      'West',
    ]);

    expectColours();
  }, 20000);

  it('removes the value of the polygon deleted with the location trash method', async () => {
    expect(location).toBeDefined();

    const id = Number(location.id);

    await trashLocation(location);

    expect(await getRecord(layer, id)).toBeNull();

    // The trash method removes the location, which reloads the layer.
    await expect
      .poll(() => layer.featuresObject?.[id], { timeout: 5000 })
      .toBeUndefined();

    await render(layer);

    // The deleted polygon is not rendered, every remaining polygon has the colour of its category in the lookup.
    expect(themeStyles(layer).map((s) => s.id)).not.toContain(id);

    expectColours();

    expect(Object.keys(layer.style.theme.lookup).sort()).toEqual([
      'East',
      'North',
      'South',
      'West',
    ]);
    expect(themeValues(layer)).not.toContain(RENAMED);
  }, 20000);

  it('assigns the previous categories to the polygons after the mapview is panned away and back', async () => {
    // No polygon is in the properties of the view.
    await panTo(
      layer,
      AWAY,
      () => Object.keys(layer.featuresObject ?? {}).length === 0,
    );

    expect(layer.style.theme.lookup).toEqual({});
    expect(themeValues(layer)).toEqual([]);

    await panTo(layer, LONDON, () =>
      seeded.every(([id]) => Object.hasOwn(layer.featuresObject ?? {}, id)),
    );

    await expect
      .poll(() => Object.keys(themeColours(layer)).sort(), { timeout: 5000 })
      .toEqual(['East', 'North', 'South', 'West']);

    expectColours();
  }, 20000);
});

// The extent of the polygon which is drawn and deleted by the compare_areas tests.
const DRAWN_EXTENT = [15000, 6705000, 25000, 6715000];

/**
Returns the fill colour of the last render for each tile feature of the layer in the view extent, with the feature geometry extent.
*/
function tileColours(layer) {
  const extent = layer.mapview.Map.getView().calculateExtent();

  return layer.L.getFeaturesInExtent(extent).map((F) => ({
    extent: F.getExtent(),
    fillColor: F.style?.fillColor,
  }));
}

/**
Review of #3079: Simon's layer config, the compare_areas layer of the scratch locale. A distributed theme on the id field, which is also the qID, with cat_arr categories in a themes object, a polygon draw config and deleteLocation.

Every polygon must have a category colour of the theme, not the default style fill colour #00f.

The tests run in order and depend on each other. The add test draws a polygon with the mapview draw interaction and the draw callback of the drawing element, and the delete test deletes the same polygon with the location.trash() method. The table is reset to the rows before the tests once in the afterAll hook, also if a test fails.
*/
describe.sequential(
  'mvt wkt_properties distributed theme on the qID field',
  () => {
    let categoryColours;
    let dispose;
    let layer;
    let location;
    let seeded;

    beforeAll(async () => {
      ({ dispose, layer } = await scratchPolygonLayer('compare_areas'));

      seeded = await tableRows(layer);

      categoryColours = layer.style.theme.categories.map(
        (cat) => cat.style.fillColor,
      );
    });

    afterAll(async () => {
      try {
        // The drawn polygon is deleted with the location_delete query if a test has failed before the delete.
        expect(await resetTable(layer, seeded)).toEqual(seeded);
      } finally {
        // The trash method has already removed the location and its remove method.
        location?.remove?.();

        dispose();
      }
    });

    /**
  Resolves once every tile feature in the view has been rendered with a category colour of the theme.
  */
    async function expectCategoryColours() {
      await render(layer);

      await expect
        .poll(
          () =>
            tileColours(layer).filter(
              (F) => !categoryColours.includes(F.fillColor),
            ),
          { timeout: 5000 },
        )
        .toEqual([]);
    }

    it.fails(
      'renders the seeded polygons with the categories of the theme',
      async () => {
        expect(layer.style.theme.key).toBe('Compare Areas');
        expect(categoryColours).toHaveLength(9);
        expect(seeded).toHaveLength(4);

        // The properties of the seeded polygons are loaded.
        await expect
          .poll(() => Object.keys(layer.featuresObject ?? {}).sort(), {
            timeout: 5000,
          })
          .toEqual(seeded.map(([id]) => String(id)).sort());

        // The id of a feature is the theme field value.
        expect(Object.values(layer.featuresObject).map((p) => p.id)).toEqual(
          Object.keys(layer.featuresObject).map(Number),
        );

        expect(tileColours(layer).length).toBeGreaterThanOrEqual(4);

        await expectCategoryColours();

        expect(Object.keys(layer.style.theme.lookup).sort()).toEqual(
          seeded.map(([id]) => String(id)).sort(),
        );
      },
    );

    it.fails(
      'renders a polygon drawn with the draw interaction with a category of the theme',
      async () => {
        location = await drawPolygon(layer, DRAWN_EXTENT);

        const id = String(location.id);

        // The create method reloads the layer. The tiles must be refreshed for the geometry of the new polygon.
        await expect
          .poll(
            () =>
              tileColours(layer).some((F) =>
                ol.extent.containsCoordinate(
                  F.extent,
                  ol.extent.getCenter(DRAWN_EXTENT),
                ),
              ),
            { timeout: 10000 },
          )
          .toBe(true);

        // The create method checks the loaded tiles for the new feature after a second and reloads the layer again if the feature has not been found.
        await new Promise((resolve) => setTimeout(resolve, 1500));

        await expectCategoryColours();

        expect(Object.keys(layer.style.theme.lookup)).toContain(id);
        expect(themeValues(layer)).toContain(id);
      },
      20000,
    );

    it.fails(
      'renders the polygons with the categories of the theme after a zoom out and in',
      async () => {
        const view = layer.mapview.Map.getView();

        const zoom = view.getZoom();

        // The properties are loaded for the view after the changeEnd.
        let loaded = changeEnd(layer.mapview);

        view.setZoom(zoom - 1);

        await loaded;

        await expect
          .poll(() => Object.keys(layer.featuresObject ?? {}).length, {
            timeout: 5000,
          })
          .toBeGreaterThanOrEqual(4);

        await expectCategoryColours();

        loaded = changeEnd(layer.mapview);

        view.setZoom(zoom);

        await loaded;

        await new Promise((resolve) => setTimeout(resolve, 1000));

        await expectCategoryColours();
      },
      20000,
    );

    it.fails(
      'removes the value of the polygon deleted with the location trash method',
      async () => {
        expect(location).toBeDefined();

        const id = String(location.id);

        await trashLocation(location);

        expect(await getRecord(layer, id)).toBeNull();

        // The trash method removes the location, which reloads the layer.
        await expect
          .poll(() => layer.featuresObject?.[id], { timeout: 5000 })
          .toBeUndefined();

        await expectCategoryColours();

        expect(Object.keys(layer.style.theme.lookup).sort()).toEqual(
          seeded.map(([id]) => String(id)).sort(),
        );
        expect(themeValues(layer)).not.toContain(id);
      },
      20000,
    );
  },
);

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
