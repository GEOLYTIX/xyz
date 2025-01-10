/**
 * ## layerTest{}
 * The layer test modules are exported as an object to be used in the local.test.mjs module in the browser tests
 * @module layer
 */

/**
 * @typedef {Object} layerTest
 * @property {Function} decorate
 * @property {Function} featureFields
 * @property {Function} featureFormats
 */
import { decorate } from './decorate.test.mjs';
import { featureFields } from './featureFields.test.mjs';
import { featureFormats } from './featureFormats.test.mjs';
import { formats } from './format/_format.test.mjs';

export const layer = {
  setup,
  formats,
  decorate,
  featureFields,
  featureFormats,
};

function setup() {
  codi.describe({ name: 'Layer:', id: 'layer' }, () => {});
}
