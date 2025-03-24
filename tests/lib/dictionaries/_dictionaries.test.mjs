/**
 * ## dictionaryTest{}
 * The dictionary test modules are exported as an object to be used in the local.test.mjs module in the browser tests
 * @module dictionaries
 */

/**
 * @typedef {Object} dictionaryTest
 * @property {baseDictionaryTest} baseDictionaryTest
 */
import { baseDictionaryTest } from './baseDictionary.test.mjs';
import { unknownLanguageTest } from './unknownLanguageTest.test.mjs';

export const dictionaryTest = {
  setup,
  baseDictionaryTest,
  unknownLanguageTest,
};

function setup() {
  codi.describe({ name: 'Dictionary:', id: 'dictionary' }, () => {});
}
