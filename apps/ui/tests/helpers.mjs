/**
Shared helpers for the MAPP.UI module tests.

The module tests use the locales and seed rows of the MAPP library tests, see [apps/mapp/tests/helpers.mjs](../../mapp/tests/helpers.mjs). The MAPP test helpers are exported from this module.

The grocery and scratch locales are templates in the [UI test workspace](workspaces/_workspace.json).

The grocery locale has the hidden `osm` tiles layer and the `retail_points` cluster layer with a categorized retailer theme, a count distribution and infoj filters. The Lidl Walworth Road store is the location for tests which don't change the record.

The scratch locale has the `scratch_location` layer with editable infoj entries. Tests which update or delete a location insert their own record into the empty example.scratch_location table.
*/

import { onTestFinished, vi } from 'vitest';
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
  createPolygon,
  drawPolygon,
  getLocale,
  getRecord,
  newLocation,
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

/**
@function mapTarget

@description
Adds a #Map element as dialog target to the document, like the default view. The element is removed when the test finishes.

The close event is dispatched on each dialog in the target first. The close method of the dialog disconnects the ResizeObserver of a non-modal dialog from its target. The event is dispatched, because the close() method of a dialog element which is not open doesn't dispatch the event.

@returns {HTMLElement} The #Map target element.
*/
export function mapTarget() {
  const target = document.createElement('div');
  target.id = 'Map';
  document.body.append(target);

  onTestFinished(() => {
    for (const node of target.querySelectorAll('dialog')) {
      node.dispatchEvent(new Event('close'));
    }

    target.remove();
  });

  return target;
}

/**
@function mockJSONEditor

@description
Stubs the esmImport of the vanilla-jsoneditor module from esm.sh with a fake createJSONEditor method. The fake editor renders a copy of the default menu with the onRenderMenu prop, and get() and set() the content. The set method is a mock.

@param {Array<Object>} defaultMenu The default menu items of the jsoneditor which are passed to the onRenderMenu prop.
@returns {Array<Object>} The array of the fake editors.
*/
export function mockJSONEditor(defaultMenu) {
  const editors = [];

  const createJSONEditor = vi.fn((params) => {
    let content = params.props.content;

    const editor = {
      menu: params.props.onRenderMenu([...defaultMenu]),
      get: () => content,
      set: vi.fn((c) => {
        content = c;
      }),
      target: params.target,
    };

    editors.push(editor);

    return editor;
  });

  vi.spyOn(mapp.utils, 'esmImport').mockResolvedValue({ createJSONEditor });

  return editors;
}

// The real timer methods. A test may fake the setTimeout method, eg. to advance a debounce.
const realSetTimeout = globalThis.setTimeout.bind(globalThis);
const realClearTimeout = globalThis.clearTimeout.bind(globalThis);

/**
@function nextTask
@description
Resolves in a new task with a real timeout. The promise reactions of a settled promise run before the next task, eg. the continuation of an async lib method which awaits the same promise.

@returns {Promise} Resolves after the pending microtasks.
*/
function nextTask() {
  return new Promise((resolve) => realSetTimeout(resolve));
}

/**
@function capturePromises

@description
Spies on an object method which returns a promise and records each call. The spy calls the original method, so the method is not mocked. The method must be called as an object property by the lib code, eg. `mapp.utils.xhr()`. A named import inside a lib module can not be spied on.

The next() method takes the first recorded call which matches and has not been taken by an earlier next() call, or waits for the next matching call. The next() method resolves with the settled value of the call once a new task has started, so the lib code which awaits the same promise has continued until its next await of a pending promise.

The next() method rejects if no matching call is recorded within the timeout. The timeout is the bound for the call to be made, not for the call to settle. A call which does not settle fails the test with the test timeout.

The spy is restored by the vi.restoreAllMocks() of the setup afterEach hook, or with the restore() method.

@param {Object} object The object with the method, eg. mapp.utils.
@param {string} key The method key.
@returns {Object} The recorded calls, and the next() and restore() methods.
*/
export function capturePromises(object, key) {
  // The spy would call itself as the original method.
  if (vi.isMockFunction(object[key])) {
    throw new Error(`The ${key} method is already a mock.`);
  }

  const method = object[key];

  const calls = [];

  const waiters = [];

  const spy = vi.spyOn(object, key).mockImplementation(function (...args) {
    const result = method.apply(this, args);

    const call = { args, promise: Promise.resolve(result) };

    calls.push(call);

    const waiter = waiters.find((waiter) => waiter.match(...args));

    if (waiter) {
      call.taken = true;
      waiter.resolve(call);
    }

    return result;
  });

  /**
  Returns the first call which matches and has not been taken, or waits for the next matching call.
  */
  function take(match, timeout) {
    const call = calls.find((call) => !call.taken && match(...call.args));

    if (call) {
      call.taken = true;
      return Promise.resolve(call);
    }

    return new Promise((resolve, reject) => {
      const waiter = { match, resolve };

      waiter.timeout = realSetTimeout(() => {
        waiters.splice(waiters.indexOf(waiter), 1);
        reject(new Error(`No matching ${key} call within ${timeout}ms.`));
      }, timeout);

      waiter.resolve = (call) => {
        realClearTimeout(waiter.timeout);
        waiters.splice(waiters.indexOf(waiter), 1);
        resolve(call);
      };

      waiters.push(waiter);
    });
  }

  async function next(match = () => true, { timeout = 15000 } = {}) {
    const call = await take(match, timeout);

    const value = await call.promise;

    await nextTask();

    return value;
  }

  return { calls, next, restore: () => spy.mockRestore() };
}

/**
@function requestTemplate
@description
Returns the query template param of a mapp.utils.xhr request.

@param {Object|string} params The xhr params or the request url.
@returns {string|null} The template param of the request url.
*/
function requestTemplate(params) {
  const url = typeof params === 'string' ? params : params?.url;

  if (!url) return null;

  return new URL(url, location.href).searchParams.get('template');
}

/**
@function captureRequests

@description
Records the mapp.utils.xhr requests of the lib code until the test finishes. The requests are sent to the testhost, they are not mocked.

The response() method resolves with the response of the first request for a query template which has not been taken by an earlier response() call, or of the next request for the template. The match can also be a method which is called with the xhr params. The lib code which awaits the request has continued until its next await of a pending promise, eg. a DOM update which follows the response is done.

A debounced request is not sent, its promise resolves with a debounce object. The response() method skips a debounced request and resolves with the response of the request which superseded it.

The capture must start before the request is made. Requests which bypass the xhr utility are not recorded, eg. the tile requests of an Openlayers source.

The response() method takes the match and an options object with the timeout of the capturePromises next() method.

@returns {Object} The recorded xhr calls and the response() method.
*/
export function captureRequests() {
  const xhr = capturePromises(mapp.utils, 'xhr');

  async function response(match, options) {
    const matches =
      typeof match === 'function'
        ? match
        : (params) => requestTemplate(params) === match;

    for (;;) {
      const response = await xhr.next(matches, options);

      // The request which superseded the debounced request is taken with the next call.
      if (!response?.debounce) return response;
    }
  }

  return { calls: xhr.calls, response };
}
