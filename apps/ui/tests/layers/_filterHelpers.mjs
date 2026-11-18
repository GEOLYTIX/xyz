/**
Shared helpers for the layer filter tests.

The grocery retail_points layer has `in` filters for the retailer and fascia fields, and a `date` filter for the open_date field. The countries locale is a template in the [UI test workspace](../workspaces/_workspace.json). The countries mvt layer has the integer pop_est field for the numeric filters.

The applyFilter method reloads the layer with a 500ms debounce, and the updatePanel method of the filter panel queries the location count with a 1000ms debounce. Tests which do not assert the layer reload replace the applyFilter method with a mock. Timers which are pending when a test finishes are cleared.
*/

import { expect, onTestFinished, vi } from 'vitest';
import { layersListview, localeMapview } from '../helpers.mjs';

// The min and max pop_est values of the naturalearth.countries seed rows.
export const POP_MIN = 140;
export const POP_MAX = 1397715000;

/**
@function countriesLayer
@async

@description
Creates a mapview for the countries locale and returns the countries mvt layer. The layer has no layer.view.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<layer>} The countries layer.
*/
export async function countriesLayer(configure) {
  const mapview = await localeMapview('countries', configure);

  return mapview.layers.countries;
}

/**
@function listview
@async

@description
Creates a layers listview for the layers of a mapview, like the default view. The listview creates the layer.view with the filter panel of each layer.

The listview target is removed and the pending updatePanel debounce of the layer is cleared when the test finishes.

@param {mapview} mapview The mapview.
@param {string} key The key of the layer with the filter panel.
@returns {Object} The mapview and the layer.
*/
function listview(mapview, key) {
  const target = document.createElement('div');

  document.body.append(target);

  mapp.ui.layers.listview({ layers: mapview.layers, target });

  const layer = mapview.layers[key];

  onTestFinished(() => {
    clearTimeout(layer.filter.debounce);
    target.remove();
  });

  return { layer, mapview };
}

/**
@function groceryPanel
@async

@description
Creates a layers listview for a grocery mapview. The retail_points layer has a filter panel.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<Object>} The mapview and the retail_points layer.
*/
export async function groceryPanel(configure) {
  const { layer, mapview } = await layersListview(configure);

  onTestFinished(() => clearTimeout(layer.filter.debounce));

  return { layer, mapview };
}

/**
@function countriesPanel
@async

@description
Creates a layers listview for a countries mapview. The infoj entries of the countries layer have no filter, the configure method must assign the filter of an entry for the countries layer to have a filter panel.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<Object>} The mapview and the countries layer.
*/
export async function countriesPanel(configure) {
  const mapview = await localeMapview('countries', configure);

  return listview(mapview, 'countries');
}

/**
@function popFilter
@description
Returns a configure method which assigns a filter to the pop_est entry of the countries layer.

@param {Object|string} filter The entry filter.
@returns {Function} The configure method.
*/
export function popFilter(filter) {
  return (layers) => {
    layers.countries.infoj.find((entry) => entry.field === 'pop_est').filter =
      filter;
  };
}

/**
@function mockApplyFilter
@description
Replaces the applyFilter method with a mock, so the layer is not reloaded.

@returns {MockInstance} The applyFilter mock.
*/
export function mockApplyFilter() {
  return vi
    .spyOn(mapp.ui.layers.filters, 'applyFilter')
    .mockImplementation(() => {});
}

/**
@function fakeTimers
@description
Fakes the setTimeout and clearTimeout methods until the test finishes.
*/
export function fakeTimers() {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

  onTestFinished(() => vi.useRealTimers());
}

/**
@function selectFilter

@description
Selects the filter for a field in the filter panel dropdown, like a user selection. The dropdown adds a filter card for a filter which is not selected, and removes the card of a selected filter.

@param {layer} layer A layer with a filter panel.
@param {string} field The filter field.
@returns {Object} The filter from the layer.filter.list.
*/
export function selectFilter(layer, field) {
  const index = layer.filter.list.findIndex((filter) => filter.field === field);

  const filter = layer.filter.list[index];

  // The dropdown option element of the filter is assigned as filter.li.
  const select = filter.li.parentElement;

  // The index 0 is the placeholder option.
  select.selectedIndex = index + 1;

  select.dispatchEvent(new Event('change'));

  return filter;
}

/**
@function addFilterCard
@async

@description
Selects the filter for a field in the filter panel dropdown and waits for the filter card.

@param {layer} layer A layer with a filter panel.
@param {string} field The filter field.
@returns {Promise<Object>} The filter with the card.
*/
export async function addFilterCard(layer, field) {
  const filter = selectFilter(layer, field);

  // The distinct values query of an in filter can take a few seconds.
  await expect
    .poll(() => filter.card, { timeout: 5000 })
    .toBeInstanceOf(HTMLElement);

  return filter;
}

/**
@function updatePanel
@description
Returns the updatePanel method of the filter panel, which is a layer.changeEndCallbacks method.

@param {layer} layer A layer with a filter panel.
@returns {Function} The updatePanel method.
*/
export function updatePanel(layer) {
  return layer.changeEndCallbacks.find((fn) => fn.name === 'updatePanel');
}

/**
@function catchRejections
@description
Collects the reasons of unhandled promise rejections until the test finishes, eg. from an async timeout callback. The browser runner does not report an unhandled rejection as an error while a test listens for the event.

@returns {Array} The reasons of the unhandled rejections.
*/
export function catchRejections() {
  const reasons = [];

  const listener = (e) => {
    e.preventDefault();
    reasons.push(e.reason);
  };

  window.addEventListener('unhandledrejection', listener);

  onTestFinished(() =>
    window.removeEventListener('unhandledrejection', listener),
  );

  return reasons;
}

/**
@function filterNode
@description
Returns the filter interface content in a div element. The numeric filter returns a template, which is rendered in the filter card.

@param {HTMLElement|Object} content The filter interface content.
@returns {HTMLElement} A div with the rendered content.
*/
export function filterNode(content) {
  return mapp.utils.html.node`<div>${[content]}`;
}
