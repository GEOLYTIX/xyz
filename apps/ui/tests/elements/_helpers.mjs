/**
Shared helpers for the ui elements, layer legends and layer panels tests.

The module is not a test file and is imported by the tests in the elements and layers directories.
*/

import { onTestFinished, vi } from 'vitest';
import { localeMapview } from '../helpers.mjs';

/**
@function mapTarget

@description
Adds a #Map element as dialog target to the document, like the default view. The drawer popout, the drawer dialog and the dataview dialog are shown in the #Map element.

The close event is dispatched on each dialog in the target when the test finishes, before the target is removed. The close method of a dialog disconnects the ResizeObserver of a non-modal dialog from its target. The event is dispatched, because the close() method of a dialog element which is not open doesn't dispatch the event.

@returns {HTMLElement} The #Map element.
*/
export function mapTarget() {
  const target = document.createElement('div');
  target.id = 'Map';
  target.style.cssText = 'position: relative; width: 800px; height: 600px;';
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
@function selectOption

@description
Selects the option with a title in a dropdown select element and dispatches the change event, like a user selection.

@param {HTMLElement} node The dropdown select element or an element which contains it.
@param {string} title The text of the option to select.
*/
export function selectOption(node, title) {
  const select =
    node instanceof HTMLSelectElement ? node : node.querySelector('select');

  const index = [...select.options].findIndex(
    (option) => option.textContent.trim() === title,
  );

  if (index < 1) throw new Error(`The dropdown has no ${title} option.`);

  select.selectedIndex = index;

  select.dispatchEvent(new Event('change'));
}

/**
@function optionTitles

@description
Returns the titles of the options of a dropdown select element without the placeholder option.

@param {HTMLElement} node The dropdown select element or an element which contains it.
@returns {Array<string>} The option titles.
*/
export function optionTitles(node) {
  const select =
    node instanceof HTMLSelectElement ? node : node.querySelector('select');

  return [...select.options]
    .slice(1)
    .map((option) => option.textContent.trim());
}

/**
@function mockJSONEditor

@description
Stubs the import of the vanilla-jsoneditor module. The createJSONEditor method of the module returns an editor stand-in with a get method which returns the content.

@returns {Object} The esmImport spy and the createJSONEditor mock.
*/
export function mockJSONEditor() {
  const createJSONEditor = vi.fn((params) => ({
    params,
    get: () => params.props.content,
  }));

  const esmImport = vi
    .spyOn(mapp.utils, 'esmImport')
    .mockResolvedValue({ createJSONEditor });

  return { createJSONEditor, esmImport };
}

/**
@function fakeType

@description
Assigns a fake dataview type as `mapp.ui.utils.fake`. The create method assigns a setData mock to the dataview. The type is deleted when the test finishes.

@param {Object} [type] Properties to assign to the type.
@returns {Object} The fake type with the create mock.
*/
export function fakeType(type = {}) {
  const fake = {
    create: vi.fn((dataview) => {
      dataview.setData = vi.fn();
    }),
    ...type,
  };

  mapp.ui.utils.fake = fake;

  onTestFinished(() => delete mapp.ui.utils.fake);

  return fake;
}

/**
@function mockUserLocale

@description
Replaces the mapp.utils.userLocale namespace with mocks, because the methods of the ESM namespace can't be spied on. The namespace is restored when the test finishes.

The list mock resolves with the locales. The putLocale mock resolves with the mapview.locale.name, like a successful put. The remove mock resolves.

@param {Array<Object>} [locales] The userlocales which the list mock resolves with.
@returns {Object} The list, putLocale and remove mocks.
*/
export function mockUserLocale(locales = []) {
  const mocks = {
    list: vi.fn().mockResolvedValue(locales),
    putLocale: vi.fn(async (mapview) => mapview.locale.name),
    remove: vi.fn().mockResolvedValue(),
  };

  const utils = mapp.utils.userLocale;
  mapp.utils.userLocale = { ...utils, ...mocks };

  onTestFinished(() => {
    mapp.utils.userLocale = utils;
  });

  return mocks;
}

/**
@function scratchListview
@async

@description
Creates a layers listview for the layers of a scratch mapview, like the default view. The listview creates the layer.view of each layer.

The compare_areas layer of the scratch locale is an mvt layer of the example.scratch_polygon table with a distributed and a basic theme. The id field of the table is referenced by the distributed theme and can be requested for a theme which is assigned in the configure method.

The listview target and the mapview target are removed when the test finishes.

@param {Function} [configure] A method to change the layer configuration.
@returns {Promise<Object>} The mapview, the listview and the compare_areas layer.
*/
export async function scratchListview(configure) {
  const mapview = await localeMapview('scratch', configure);

  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  const listview = mapp.ui.layers.listview({ layers: mapview.layers, target });

  return { layer: mapview.layers.compare_areas, listview, mapview };
}
