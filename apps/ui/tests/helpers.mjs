/**
Shared helpers for the MAPP.UI module tests.

The module tests use the locales and seed rows of the MAPP library tests, see [apps/mapp/tests/helpers.mjs](../../mapp/tests/helpers.mjs). The MAPP test helpers are exported from this module.

The grocery locale is a template in the [UI test workspace](workspaces/_workspace.json). The locale has the hidden `osm` tiles layer and the `retail_points` cluster layer with a categorized retailer theme, a count distribution and infoj filters.
*/

import { onTestFinished } from 'vitest';
import {
  addLayers,
  createMapview,
  getLocale,
} from '../../mapp/tests/helpers.mjs';

export {
  addLayers,
  changeEnd,
  createMapview,
  getLocale,
} from '../../mapp/tests/helpers.mjs';

/**
@function groceryMapview
@async

@description
Creates a mapview for the grocery locale in the locale view and adds the locale layers. The layer data has been loaded when the promise resolves.

The configure method is called with the locale layers by their key before the mapview is created, eg. to assign a layer.group or layer.viewConfig.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<mapview>} The mapview with the osm and retail_points layers.
*/
export async function groceryMapview(configure) {
  const locale = await getLocale('grocery');

  configure?.(Object.fromEntries(locale.layers.map((l) => [l.key, l])));

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapview;
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
