/**
Shared helpers for the MAPP.UI module tests.

The module tests use the locales and seed rows of the MAPP library tests, see [apps/mapp/tests/helpers.mjs](../../mapp/tests/helpers.mjs). The MAPP test helpers are exported from this module.

The grocery and scratch locales are templates in the [UI test workspace](workspaces/_workspace.json).

The grocery locale has the hidden `osm` tiles layer and the `retail_points` cluster layer with a categorized retailer theme, a count distribution and infoj filters. The Lidl Walworth Road store is the location for tests which don't change the record.

The scratch locale has the `scratch_location` layer with editable infoj entries. Tests which update or delete a location insert their own record into the empty example.scratch_location table.
*/

import { onTestFinished } from 'vitest';
import {
  addLayers,
  createMapview,
  getLocale,
  newLocation,
} from '../../mapp/tests/helpers.mjs';

export {
  addLayers,
  changeEnd,
  createMapview,
  getLocale,
  getRecord,
  newLocation,
} from '../../mapp/tests/helpers.mjs';

// Lidl Walworth Road in the grocery locale view.
export const LIDL = 1010025395;

/**
@function localeMapview
@async

@description
Creates a mapview for a locale in the locale view and adds the locale layers. The layer data has been loaded when the promise resolves.

The configure method is called with the locale layers by their key before the mapview is created, eg. to assign a layer.group or layer.viewConfig.

@param {string} key The locale template key in the test workspace.
@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<mapview>} The mapview with the locale layers.
*/
export async function localeMapview(key, configure) {
  const locale = await getLocale(key);

  configure?.(Object.fromEntries(locale.layers.map((l) => [l.key, l])), locale);

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapview;
}

/**
@function groceryMapview
@async

@description
Creates a mapview for the grocery locale with the osm and retail_points layers.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<mapview>} The mapview with the osm and retail_points layers.
*/
export async function groceryMapview(configure) {
  return localeMapview('grocery', configure);
}

/**
@function layersListview
@async

@description
Creates a layers listview for the layers of a grocery mapview, like the default view. The listview creates the layer.view of each layer.

The listview target is removed when the test finishes.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<Object>} The mapview, the listview, the retail_points layer and the layers of the addLayerView events.
*/
export async function layersListview(configure) {
  const mapview = await groceryMapview(configure);

  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  const events = [];

  target.addEventListener('addLayerView', (e) => events.push(e.detail));

  const listview = mapp.ui.layers.listview({
    layers: mapview.layers,
    target,
  });

  return { events, layer: mapview.layers.retail_points, listview, mapview };
}

/**
@function locationsListview

@description
Creates a locations listview for a mapview, like the default view. A location which is assigned to the mapview.locations gets a record and a location.view in the listview target.

The locations listview clicks the layers and locations tabs of the default view. The tabs are added to the document and are not removed, because the listview checks the tabs with a timeout after a location is removed.

The listview target is removed when the test finishes.

@param {mapview} mapview The mapview.
@returns {Object} The listview target, and the layers and locations tabs.
*/
export function locationsListview(mapview) {
  const tabs = {};

  for (const id of ['layers', 'locations']) {
    tabs[id] = document.querySelector(`body > [data-id=${id}]`);

    if (tabs[id]) continue;

    tabs[id] = document.createElement('button');

    tabs[id].dataset.id = id;

    document.body.append(tabs[id]);
  }

  const target = document.createElement('div');

  target.id = 'locations';

  document.body.append(target);

  onTestFinished(() => target.remove());

  mapp.ui.locations.listview({ mapview, target });

  return { tabs, target };
}

/**
@function lidlLocation
@async

@description
Gets the Lidl Walworth Road location of the retail_points layer in a grocery mapview with a locations listview. The listview creates the location.view.

The location record must not be changed. Use the scratchLocation method for tests which update or delete a location.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<Object>} The location, its layer and mapview, and the listview target and tabs.
*/
export async function lidlLocation(configure) {
  const mapview = await groceryMapview(configure);

  const listview = locationsListview(mapview);

  const layer = mapview.layers.retail_points;

  const location = await mapp.location.get({ layer, id: LIDL });

  return { layer, location, mapview, ...listview };
}

/**
@function scratchLocation
@async

@description
Inserts a record into the example.scratch_location table and gets its location in a scratch mapview with a locations listview. The listview creates the location.view.

@param {Function} [configure] A method to change the layer configuration.
@param {Object} [values] Field values to assign to the default values of the record.
@returns {Promise<Object>} The location, its layer and mapview, and the listview target and tabs.
*/
export async function scratchLocation(configure, values) {
  // The record has a geometry in the scratch locale view. The text entry method throws for the [null, null] value of the coords entry of a record without a geometry.
  // https://github.com/GEOLYTIX/xyz/issues/3078
  values = {
    name: 'Scratch',
    category: 'a',
    size: 1,
    geom: { type: 'Point', coordinates: [-0.1, 51.5] },
    ...values,
  };

  const mapview = await localeMapview('scratch', configure);

  const listview = locationsListview(mapview);

  const layer = mapview.layers.scratch_location;

  const id = await newLocation(layer, values);

  const location = await mapp.location.get({ layer, id });

  return { layer, location, mapview, ...listview };
}

/**
@function entry
@description
Returns the infoj entry of a location for a field.

@param {location} location A decorated location.
@param {string} field The entry field.
@returns {infoj-entry} The infoj entry.
*/
export function entry(location, field) {
  return location.infoj.find((entry) => entry.field === field);
}
