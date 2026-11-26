/**
Shared helpers for the location entry tests.

Most entry methods only read the entry and dispatch a valChange event on the location view. The stubEntry helper creates an entry with a stub location for these tests, without a location request to the testhost.
*/

import { onTestFinished, vi } from 'vitest';

/**
@function stubEntry

@description
Creates an infoj entry with a stub location. The location has a view element, empty removeCallbacks and Layers arrays, and a layer with the testhost as mapview.host.

The details of the valChange events on the location view are collected in the changes array.

@param {Object} [params] Properties to assign to the entry, eg. a type, value or edit config.
@returns {Object} The entry, the stub location and the changes array.
*/
export function stubEntry(params = {}) {
  const view = document.createElement('div');

  const changes = [];

  view.addEventListener('valChange', (e) => changes.push(e.detail));

  const location = {
    Layers: [],
    layer: { mapview: { host: mapp.host } },
    removeCallbacks: [],
    view,
  };

  const entry = { location, ...params };

  return { changes, entry, location };
}

/**
@function append

@description
Appends an element to the document, eg. a checkbox which dispatches a change event on click only in the document. The element is removed when the test finishes.

@param {HTMLElement} node The element to append.
@returns {HTMLElement} The appended element.
*/
export function append(node) {
  document.body.append(node);

  onTestFinished(() => node.remove());

  return node;
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
