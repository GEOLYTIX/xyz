/**
 * ## pluginsTest{}
 * The plugins test modules are exported as an object to be used in the local.test.mjs module in the browser tests
 * @module plugins
 */

/**
 * @typedef {Object} pluginsTest
 * @property {linkButtonTest} linkButtonTest
 */
import { linkButtonTest } from './link_button.test.mjs';

export const pluginsTest = {
  linkButtonTest,
};
