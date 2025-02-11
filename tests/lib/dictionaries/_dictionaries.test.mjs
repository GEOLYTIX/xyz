/**
 * ## dictionaryTest{}
 * The dictionary test modules are exported as an object to be used in the local.test.mjs module in the browser tests
 * @module dictionaries
 */

/**
 * @typedef {Object} dictionaryTest
 * @property {baseDictionaryTest} baseDictionaryTest
 * @property {keyValueDictionaryTest} keyValueDictionaryTest
 */
import { baseDictionaryTest } from './baseDictionary.test.mjs';
import { keyValueDictionaryTest } from './keyValueDictionary.test.mjs';
import { unknownLanguageTest } from './unknownLanguageTest.test.mjs';

export const dictionaryTest = {
  baseDictionaryTest,
  keyValueDictionaryTest,
  unknownLanguageTest,
};
