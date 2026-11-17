/**
Shared helpers for the MAPP library browser tests.

## Test data

The testhost serves the XYZ API with [workspaces/_workspace.json](workspaces/_workspace.json) against the seeded devdb tables, see [packages/devdb/README.md](../../../packages/devdb/README.md). Tests depend on the seeded rows. Add new seed files and tables for new fixtures rather than changing existing rows.

example.locations with EPSG:4326 points:

| id | name     | category |
|----|----------|----------|
| 1  | Geolytix | office   |
| 2  | Paris    | city     |
| 3  | Berlin   | city     |
| 4  | Madrid   | city     |

example.features with EPSG:3857 geometries in London and Berlin:

| id | name             | category | geom       |
|----|------------------|----------|------------|
| 1  | Thames Path      | path     | LineString |
| 2  | Hyde Park        | park     | Polygon    |
| 3  | Unnamed          | NULL     | Point      |
| 4  | Lost Park        | park     | NULL       |
| 5  | Brandenburg Gate | landmark | Point      |

geodata.uk_glx_open_retail_points has 19,229 UK grocery stores with EPSG:4326 points in the geom_p_4326 column. The grocery locale has the retail_points cluster layer of the GEOLYTIX MAPP product workspace. The locale view at z13 in south London has 39 stores.

naturalearth.countries has 177 Natural Earth 1:110m countries. The countries locale has the countries mvt layer with the geom_3857 MultiPolygons. The testhost encodes the vector tiles, see packages/testhost/README.md.

example.scratch_location is an empty table for location create, update and delete tests. The scratch locale has the scratch_location layer with editable infoj entries. Each test inserts its own record with newLocation(), because all test files of a run share the devdb.

example.scratch_polygon has 4 EPSG:3857 polygons around London with distinct names: North, East, South and West. The scratch locale has the hidden scratch_polygon mvt layer with wkt_properties and a distributed theme on the name field. Tests which create polygons must delete them again, see resetTable().

## Workspaces

The default locale of the _workspace.json has the hidden `osm` tiles layer from the testhost osm template, so every locale has the `osm` layer.

Each test suite which requests the XYZ API has a locale file in [workspaces/locales](workspaces/locales/). The locale file is added as a template to the _workspace.json and requested by its template key, eg. `getLocale('smoke')`.
*/

import { expect, onTestFinished, vi } from 'vitest';

/**
@function getLocale
@async

@description
Requests a locale with its layers from the testhost workspace.

@param {string} key The locale template key in the test workspace.
@returns {Promise<Object>} The locale.
*/
export async function getLocale(key) {
  const locale = await mapp.utils.xhr(
    `${mapp.host}/api/workspace/locale?locale=${key}&layers=true`,
  );

  if (locale instanceof Error) throw locale;

  return locale;
}

/**
@function createMapview
@async

@description
Creates a mapview in a sized target element. The target is removed and the Openlayers map disposed when the test finishes.

The layers are not added to the mapview. Use `await addLayers(mapview)` to add the locale layers and await the render.

@param {Object} locale The locale for the mapview.
@param {Object} [view] The initial view, eg. `{ lat: 51.5, lng: -0.1, z: 10 }`.
@param {Object} [params] Additional mapview params, eg. `{ attribution: {} }`.
@returns {Promise<mapview>} The decorated mapview.
*/
export async function createMapview(locale, view, params = {}) {
  const target = document.createElement('div');

  target.style.cssText = 'position:relative;width:800px;height:600px;';

  document.body.append(target);

  const mapview = await mapp.Mapview({
    host: mapp.host,
    target,
    locale: structuredClone(locale),
    view: view && { ...view },
    ...params,
  });

  onTestFinished(() => {
    // A debounced changeEnd must not run after the test, or the coverage depends on the test timing.
    clearTimeout(mapview.changeEndTimer);
    mapview.Map.setTarget(null);
    mapview.Map.dispose();
    target.remove();
  });

  return mapview;
}

/**
@function changeEnd
@async

@description
Resolves once the debounced mapview.changeEnd has called the changeEndCallbacks and the layer.changeEnd methods.

The promise must be created before the map view changes.

@param {mapview} mapview The mapview.
@returns {Promise<mapview>} The mapview after the changeEnd.
*/
export async function changeEnd(mapview) {
  let callback;

  // The promise resolves after the timer has called the layer.changeEnd methods.
  await new Promise((resolve) => {
    callback = resolve;
    mapview.changeEndCallbacks.push(callback);
  });

  // The callback is removed after the changeEndCallbacks iteration.
  mapview.changeEndCallbacks.splice(
    mapview.changeEndCallbacks.indexOf(callback),
    1,
  );

  return mapview;
}

/**
@function addLayers
@async

@description
Adds layers to the mapview and awaits the mapview.renderComplete promise.

@param {mapview} mapview The mapview.
@param {Array} [layers] The layers to add. Defaults to the mapview locale layers.
@returns {Promise<mapview>} The mapview with the layers rendered.
*/
export async function addLayers(mapview, layers = mapview.locale.layers) {
  await mapview.addLayer(layers);

  await mapview.renderComplete;

  return mapview;
}

/**
@function sourceFeatures
@description
Returns the features of a vector layer source sorted by their id property. The wkt and geojson formats assign the qID value as the id property.

@param {layer} layer A decorated vector layer.
@returns {Array<ol.Feature>} The source features.
*/
export function sourceFeatures(layer) {
  return layer.L.getSource()
    .getFeatures()
    .sort((a, b) => a.get('id') - b.get('id'));
}

/**
@function newLocation
@async

@description
Inserts a record into the layer table with the location_new query template and returns the id of the new record.

Tests which create, update or delete locations use the scratch_location layer of the scratch locale. Each test inserts its own record, because all test files of a run share the devdb.

@param {layer} layer A decorated layer.
@param {Object} [values] The field values of the record, eg. `{ name: 'one' }`.
@returns {Promise<string>} The id of the new record. The xhr rejects if the insert fails.
*/
export async function newLocation(layer, values = {}) {
  const id = await mapp.utils.xhr({
    method: 'POST',
    url: `${mapp.host}/api/query?${mapp.utils.paramString({
      layer: layer.key,
      locale: layer.mapview.locale.key,
      table: layer.table,
      template: 'location_new',
    })}`,
    body: JSON.stringify(values),
  });

  return id;
}

/**
@function getRecord
@async

@description
Requests a record of the layer table with the location_get query template. The record has the fields and fieldfx of the layer infoj.

@param {layer} layer A decorated layer.
@param {string} id The record id.
@returns {Promise<Object|null>} The record or null if the table has no record with the id.
*/
export async function getRecord(layer, id) {
  const record = await mapp.utils.xhr(
    `${mapp.host}/api/query?${mapp.utils.paramString({
      id,
      layer: layer.key,
      locale: layer.mapview.locale.key,
      table: layer.table,
      template: 'location_get',
    })}`,
  );

  return record ?? null;
}

/**
@function tableRows
@async

@description
Requests the id and name of every row with a geometry in the layer table with the wkt query template. The rows are sorted by id.

@param {layer} layer A decorated layer with a name field.
@returns {Promise<Array>} The [id, name] rows of the layer table.
*/
export async function tableRows(layer) {
  const rows = await mapp.utils.xhr(
    `${mapp.host}/api/query?${mapp.utils.paramString({
      fields: 'name',
      geom: layer.geom,
      layer: layer.key,
      locale: layer.mapview.locale.key,
      no_geom: true,
      table: layer.table,
      template: 'wkt',
    })}`,
  );

  if (!Array.isArray(rows)) return [];

  return rows.sort((a, b) => a[0] - b[0]);
}

/**
@function resetTable
@async

@description
Deletes every row of the layer table which is not in the rows argument with the location_delete query template, which is the query of the location.trash() method. Returns the rows of the table after the reset.

The serial sequence of the table is not reset. The testhost seeds a new in-memory devdb for every test run, so the ids of a run do not depend on a previous run.

@param {layer} layer A decorated layer with a name field.
@param {Array} rows The [id, name] rows to keep, eg. the rows before the tests.
@returns {Promise<Array>} The [id, name] rows of the layer table after the reset.
*/
export async function resetTable(layer, rows) {
  const keep = new Set(rows.map(([id]) => id));

  for (const [id] of await tableRows(layer)) {
    if (keep.has(id)) continue;

    await mapp.utils.xhr(
      `${mapp.host}/api/query?${mapp.utils.paramString({
        id,
        layer: layer.key,
        locale: layer.mapview.locale.key,
        table: layer.table,
        template: 'location_delete',
      })}`,
    );
  }

  return tableRows(layer);
}

/**
@function scratchPolygonLayer
@async

@description
Creates a mapview for the scratch locale and adds the scratch_polygon mvt layer with wkt_properties and a distributed theme on the name field.

The layer is shown and its properties are loaded for the locale view when the promise resolves. The mapview.changeEnd is not stopped, so a location create or trash runs the same properties loads as in the default view.

The mapview is kept for the tests of a describe block, which depend on each other. It must be disposed with the returned dispose method in an afterAll hook.

@returns {Promise<Object>} The scratch_polygon layer and the dispose method.
*/
export async function scratchPolygonLayer() {
  const locale = await getLocale('scratch');

  const layers = locale.layers.filter((l) => l.key === 'scratch_polygon');

  layers[0].display = true;

  const target = document.createElement('div');

  target.style.cssText = 'position:relative;width:800px;height:600px;';

  document.body.append(target);

  const mapview = await mapp.Mapview({
    host: mapp.host,
    target,
    locale: structuredClone(locale),
    view: { ...locale.view },
  });

  await mapview.addLayer(layers);

  await mapview.renderComplete;

  const layer = mapview.layers.scratch_polygon;

  function dispose() {
    clearTimeout(mapview.changeEndTimer);
    mapview.Map.setTarget(null);
    mapview.Map.dispose();
    target.remove();
  }

  return { dispose, layer };
}

/**
@function createPolygon
@async

@description
Creates a location for a polygon with the mapp.location.create method, as the draw interaction does. The create method inserts the record, reloads the layer, checks the tiles for the new feature after a second and gets the location.

@param {layer} layer The scratch_polygon layer.
@param {string} name The name of the new polygon.
@param {Array} extent The EPSG:3857 extent of the polygon.
@returns {Promise<location>} The location of the new polygon.
*/
export async function createPolygon(layer, name, extent) {
  const geometry = new ol.format.GeoJSON().writeGeometryObject(
    ol.geom.Polygon.fromExtent(extent),
  );

  await mapp.location.create(
    { type: 'Feature', geometry },
    { defaults: { name } },
    layer,
  );

  // The create method does not wait for the location get.
  let location;

  await expect
    .poll(
      () =>
        (location = Object.values(layer.mapview.locations).find(
          (l) => l.layer === layer,
        )),
      { timeout: 5000 },
    )
    .toBeDefined();

  return location;
}

/**
@function trashLocation
@async

@description
Deletes the location record with the location.trash() method. Only the mapp.utils.confirm dialog is stubbed.

@param {location} location The location to delete.
*/
export async function trashLocation(location) {
  const confirm = vi
    .spyOn(mapp.utils, 'confirm')
    .mockImplementation(async () => true);

  try {
    await location.trash();
  } finally {
    confirm.mockRestore();
  }
}

/**
@function renderedFeatures
@description
Returns the rendered features of a wkt_properties mvt layer in the view extent. A tile feature without properties in the layer.featuresObject is not rendered.

@param {layer} layer A decorated mvt layer with wkt_properties.
@returns {Array} The rendered tile features.
*/
export function renderedFeatures(layer) {
  const extent = layer.mapview.Map.getView().calculateExtent();

  return layer.L.getFeaturesInExtent(extent).filter((F) =>
    Object.hasOwn(layer.featuresObject ?? {}, F.get('id')),
  );
}

/**
@function themeStyles
@description
Returns the name, fill colour and lookup fill colour of the distributed theme for each rendered feature. The fill colour is from the feature style of the last render.

@param {layer} layer A decorated mvt layer with wkt_properties and a distributed theme on the name field.
@returns {Array<Object>} The rendered feature styles.
*/
export function themeStyles(layer) {
  const theme = layer.style.theme;

  return renderedFeatures(layer).map((F) => {
    const { name } = layer.featuresObject[F.get('id')];

    return {
      fillColor: F.style?.fillColor,
      id: F.get('id'),
      lookup: theme.lookup?.[name]?.style.fillColor,
      name,
    };
  });
}

/**
@function themeValues
@description
Returns the values assigned to the categories of the layer theme. The distributed theme legend is drawn from these values.

@param {layer} layer A decorated layer with a distributed theme.
@returns {Array<string>} The category values.
*/
export function themeValues(layer) {
  return layer.style.theme.categories.flatMap((cat) => cat.values ?? []);
}

/**
@function render
@async

@description
Renders the mapview and resolves on the rendercomplete event.

@param {layer} layer A decorated layer.
*/
export function render(layer) {
  const rendered = new Promise((resolve) =>
    layer.mapview.Map.once('rendercomplete', resolve),
  );

  layer.mapview.Map.render();

  return rendered;
}
