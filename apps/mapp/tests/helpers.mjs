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
@function pointerEvent

@description
Passes an Openlayers MapBrowserEvent for a pixel of the map to the mapview.Map. The Map dispatches the event to its listeners, eg. the pointermove and click methods of the highlight interaction, and to its interactions, eg. the Openlayers Draw and Modify interactions.

This is how the Openlayers library tests its own interactions. The events are handled synchronously, and the test controls the pointerType, button and buttons of the original event. The mousedown, mouseup and mouseleave listeners on the map target are not called. Dispatch these events on the mapview.Map.getTargetElement().

The Map only handles events once it has rendered a frame. The Map is rendered if the test has not awaited a render yet.

The original event is a mouse PointerEvent with the primary pointer. The default condition of the Openlayers Modify interaction requires the primary pointer, and the Map only handles a pointerdown with a target in the document.

@param {mapview} mapview The mapview.
@param {string} type The event type: pointermove, pointerdown, pointerdrag, pointerup, click, singleclick or dblclick.
@param {Array<number>} pixel The [x, y] pixel in the map viewport.
@param {Object} [init] PointerEvent properties, eg. `{ pointerType: 'touch' }` or `{ buttons: 2 }`.
@returns {ol.MapBrowserEvent} The handled event.
*/
export function pointerEvent(mapview, type, pixel, init = {}) {
  // The Map has no frame state before the first render.
  if (!mapview.Map.getCoordinateFromPixel([0, 0])) mapview.Map.renderSync();

  const viewport = mapview.Map.getViewport();

  const rect = viewport.getBoundingClientRect();

  const originalEvent = new PointerEvent(type, {
    bubbles: true,
    clientX: rect.left + pixel[0],
    clientY: rect.top + pixel[1],
    isPrimary: true,
    pointerId: 1,
    pointerType: 'mouse',
    ...init,
  });

  // The target of an event which is not dispatched is null.
  Object.defineProperty(originalEvent, 'target', {
    value: viewport.firstChild,
  });

  const event = new ol.MapBrowserEvent(type, mapview.Map, originalEvent);

  mapview.Map.handleMapBrowserEvent(event);

  return event;
}

/**
@function pointerClick

@description
Passes the events of a click on a pixel of the map to the mapview.Map with the pointerEvent method: pointermove, pointerdown, pointerup, click and singleclick.

Openlayers dispatches the singleclick 250ms after a click which is not a double click. The singleclick is passed right after the click here.

@param {mapview} mapview The mapview.
@param {Array<number>} pixel The [x, y] pixel in the map viewport.
@param {Object} [init] PointerEvent properties for every event, eg. `{ pointerType: 'touch' }`. The pointerdown has the left button by default. Use `{ buttons: 2 }` for a right click.
*/
export function pointerClick(mapview, pixel, init = {}) {
  pointerEvent(mapview, 'pointermove', pixel, { ...init, buttons: 0 });
  pointerEvent(mapview, 'pointerdown', pixel, { buttons: 1, ...init });
  pointerEvent(mapview, 'pointerup', pixel, { ...init, buttons: 0 });
  pointerEvent(mapview, 'click', pixel, { ...init, buttons: 0 });
  pointerEvent(mapview, 'singleclick', pixel, { ...init, buttons: 0 });
}

/**
@function pointerDrag

@description
Passes the events of a drag from a pixel to another pixel of the map to the mapview.Map with the pointerEvent method: pointermove, pointerdown, pointerdrag and pointerup.

@param {mapview} mapview The mapview.
@param {Array<number>} from The [x, y] pixel of the pointerdown.
@param {Array<number>} to The [x, y] pixel of the pointerup.
*/
export function pointerDrag(mapview, from, to) {
  pointerEvent(mapview, 'pointermove', from);
  pointerEvent(mapview, 'pointerdown', from, { buttons: 1 });
  pointerEvent(mapview, 'pointerdrag', to, { buttons: 1 });
  pointerEvent(mapview, 'pointerup', to);
}

/**
@function pixelPosition

@description
Returns the position of a map pixel in the map target element for the userEvent methods of the vitest/browser module, eg. `userEvent.click(target, { position })`.

The userEvent methods send real input to the browser through the Playwright provider. The events go through the event handling of the browser and of Openlayers, which the pointerEvent method skips. The methods are async and slower. Openlayers dispatches the click of a real input 250ms before the singleclick.

@param {Array<number>} pixel The [x, y] pixel in the map viewport.
@returns {Object} The position with x and y.
*/
export function pixelPosition(pixel) {
  return { x: Math.round(pixel[0]), y: Math.round(pixel[1]) };
}

/**
@function tableRows
@async

@description
Requests the id and theme field value of every row with a geometry in the layer table with the wkt query template. The rows are sorted by id.

@param {layer} layer A decorated layer with a theme field, eg. name.
@returns {Promise<Array>} The [id, value] rows of the layer table.
*/
export async function tableRows(layer) {
  const rows = await mapp.utils.xhr(
    `${mapp.host}/api/query?${mapp.utils.paramString({
      fields: layer.style?.theme?.field ?? 'name',
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
Creates a mapview for the scratch locale and adds a layer of the example.scratch_polygon table, eg. the scratch_polygon mvt layer with wkt_properties and a distributed theme on the name field.

The layer is shown and its properties are loaded for the locale view when the promise resolves. The mapview.changeEnd is not stopped, so a location create or trash runs the same properties loads as in the default view.

The mapview is kept for the tests of a describe block, which depend on each other. It must be disposed with the returned dispose method in an afterAll hook.

@param {string} [key='scratch_polygon'] The key of the layer in the scratch locale.
@returns {Promise<Object>} The layer and the dispose method.
*/
export async function scratchPolygonLayer(key = 'scratch_polygon') {
  const locale = await getLocale('scratch');

  const layers = locale.layers.filter((l) => l.key === key);

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

  const layer = mapview.layers[key];

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
Returns the theme field value as name, the fill colour and the lookup fill colour of the distributed theme for each rendered feature. The fill colour is from the feature style of the last render.

@param {layer} layer A decorated mvt layer with wkt_properties and a distributed theme.
@returns {Array<Object>} The rendered feature styles.
*/
export function themeStyles(layer) {
  const theme = layer.style.theme;

  return renderedFeatures(layer).map((F) => {
    const name = String(layer.featuresObject[F.get('id')][theme.field]);

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

/**
@function themeColours
@description
Returns the fill colour of each rendered feature by its theme field value, eg. the name of a scratch_polygon.

@param {layer} layer A decorated mvt layer with wkt_properties and a distributed theme on the name field.
@returns {Object} The fill colours keyed by name.
*/
export function themeColours(layer) {
  return Object.fromEntries(
    themeStyles(layer).map((s) => [s.name, s.fillColor]),
  );
}

/**
@function renameLocation
@async

@description
Updates the name of a location record with the location.update() method, as the name input of the location view does. The update method reloads the layer.

@param {location} location The location to update.
@param {string} name The new name.
*/
export async function renameLocation(location, name) {
  location.infoj.find((entry) => entry.field === 'name').newValue = name;

  await location.update();
}

/**
@function panTo
@async

@description
Centres the mapview on the coordinate and resolves once the layer properties for the new view have been loaded.

@param {layer} layer A decorated mvt layer with wkt_properties.
@param {Array} coordinate The EPSG:3857 centre.
@param {Function} loaded A method which returns true once the properties of the new view are loaded.
*/
export async function panTo(layer, coordinate, loaded) {
  layer.mapview.Map.getView().setCenter(coordinate);

  await expect.poll(loaded, { timeout: 5000 }).toBe(true);

  await render(layer);
}

/**
@function drawPolygon
@async

@description
Draws a polygon with the mapview draw interaction of the layer.draw.polygon config, as the polygon button of the drawing element does. The feature of the draw interaction source is saved with the interaction.finish() method, as the save option of the draw context menu does. The callback creates the location with the mapp.location.create method without waiting for it, as the drawing element does.

@param {layer} layer A decorated layer with a draw.polygon config.
@param {Array} extent The extent of the polygon in the mapview projection.
@returns {Promise<location>} The location of the new polygon.
*/
export async function drawPolygon(layer, extent) {
  const mapview = layer.mapview;

  const interaction = {
    type: 'Polygon',
    ...layer.draw.polygon,
    layer,
    callback: (feature) => {
      mapp.location.create(feature, interaction, layer);

      delete mapview.interaction;
    },
  };

  mapview.interactions.draw(interaction);

  mapview.interaction.source.addFeature(
    new ol.Feature(ol.geom.Polygon.fromExtent(extent)),
  );

  mapview.interaction.finish(mapview.interaction.getFeature());

  let location;

  await expect
    .poll(
      () =>
        (location = Object.values(mapview.locations).find(
          (l) => l.layer === layer,
        )),
      { timeout: 5000 },
    )
    .toBeDefined();

  return location;
}
