/**
 * ## layerTest{}
 * The layer test modules are exported as an object to be used in the local.test.mjs module in the browser tests
 * @module layer 
 */

/**
 * @typedef {Object} layerTest
 * @property {decorateTest} decorateTest
 * @property {Function} fadeTest
 * @property {Function} featureFieldsTest
 * @property {Function} featureFormatsTest
 * @property {Function} featureHoverTest
 * @property {Function} featureStyleTest
 * @property {Function} styleParserTest
 */
import { decorateTest } from './decorate.test.mjs';
import { featureFieldsTest } from './featureFields.test.mjs';
import { featureFormatsTest } from './featureFormats.test.mjs';

export const layerTest = {
    decorateTest,
    featureFieldsTest,
    featureFormatsTest
};