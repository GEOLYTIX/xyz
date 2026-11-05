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

## Workspaces

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
@returns {Promise<mapview>} The decorated mapview.
*/
export async function createMapview(locale, view) {
  const target = document.createElement('div');

  target.style.cssText = 'position:relative;width:800px;height:600px;';

  document.body.append(target);

  const mapview = await mapp.Mapview({
    host: mapp.host,
    target,
    locale: structuredClone(locale),
    view: view && { ...view },
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
