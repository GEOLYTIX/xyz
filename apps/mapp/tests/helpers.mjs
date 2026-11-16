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

## Workspaces

The default locale of the _workspace.json has the hidden `osm` tiles layer from the testhost osm template, so every locale has the `osm` layer.

Each test suite which requests the XYZ API has a locale file in [workspaces/locales](workspaces/locales/). The locale file is added as a template to the _workspace.json and requested by its template key, eg. `getLocale('smoke')`.
*/

import { onTestFinished } from 'vitest';

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
