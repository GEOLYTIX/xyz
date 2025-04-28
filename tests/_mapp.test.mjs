/**
## _mappTest
* Exports test functions for various MAPP modules to the global scope.
* This is used by the test runner to execute tests for different parts of the MAPP library.
@module _mappTest
*/

import { integrityTests } from './browser/integrity/_integrity.test.mjs';
import { coreTest } from './browser/local.test.mjs';
import { uiTest } from './lib/_ui.test.mjs';
import { dictionaryTest } from './lib/dictionaries/_dictionaries.test.mjs';
import { layer } from './lib/layer/_layer.test.mjs';
import { locationTest } from './lib/location/_location.test.mjs';
import { mappTest } from './lib/mapp.test.mjs';
import { mapviewTest } from './lib/mapview/_mapview.test.mjs';
import { utilsTest } from './lib/utils/_utils.test.mjs';

/**
 * @global
 * @name _mappTest
 * @type {object}
 * @description An object containing test functions for various MAPP modules.
 * This object is assigned to the global scope to be accessible by the test runner.
 * Each property of this object is a test function or a set of test functions for a specific module.
 *
 * @property {function} coreTest - Test functions for core MAPP functionality, this will run the other test functions.
 * @property {function} mappTest - Test functions for the mapp object.
 * @property {function} integrityTests - Test functions for 3rd party (db servers) integrity.
 * @property {function} layer - Test functions for the layer module.
 * @property {function} dictionaryTest - Test functions for the dictionaries module.
 * @property {function} locationTest - Test functions for the location module.
 * @property {function} mapviewTest - Test functions for the mapview module.
 * @property {function} uiTest - Test functions for the UI module.
 * @property {function} utilsTest - Test functions for the utils module.
 */
globalThis._mappTest = {
  coreTest,
  mappTest,
  integrityTests,
  layer,
  dictionaryTest,
  locationTest,
  mapviewTest,
  uiTest,
  utilsTest,
};
