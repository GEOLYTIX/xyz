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
import { decorate } from './decorate.test.mjs';
import { featureFields } from './featureFields.test.mjs';
import { featureFormats } from './featureFormats.test.mjs';

export const layerTest = {
    setup,
    decorate,
    featureFields,
    featureFormats
};

function setup() {
    codi.describe({ name: 'Layer:', id: 'layer' }, () => { });
}