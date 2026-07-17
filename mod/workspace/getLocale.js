/**
## /workspace/getLocale
The getLocale module exports the getLocale method which is required by the getLayer and workspace modules.

@requires /utils/envReplace
@requires /utils/merge
@requires /workspace/cache
@requires /workspace/composeObj
@requires /workspace/getTemplate

@module /workspace/getLocale
*/

import envReplace from '../utils/envReplace.js';
import merge from '../utils/merge.js';
import workspaceCache from './cache.js';
import composeObj from './composeObj.js';
import getLayer from './getLayer.js';
import getTemplate from './getTemplate.js';

/**
@function getLocale
@async

@description
Nested locales can be requested by providing an array of locale keys. The first locale key will be used to retrieve the locale object and the remaining locale keys will be merged into the first locale as nested locales.

The getLocale method will return an error if the requesting user does not have access to the locale.

@param {Object} params
@param {Object} [parentLocale] Locale will be merged into optional parentLocale to create a nested locale.
@property {string} [params.locale] Locale key.
@property {array} [params.locale] An array of locale keys to be merged as a nested locale.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.
@property {Boolean} [params.layers] Whether to retrieve layers for the locale.

@returns {Promise<Object|Error>} JSON Locale.
*/
export default async function getLocale(params, parentLocale) {
  const workspace = await workspaceCache();

  if (typeof params.locale === 'string') {
    params.locale = params.locale.split(',');
  }

  let localeKey = Array.isArray(params.locale)
    ? params.locale.shift()
    : params.locale;

  localeKey ??= 'locale';

  let locale;

  if (localeKey === 'locale') {
    locale = structuredClone(workspace.locale);
    locale.key ??= localeKey;
  } else if (Object.hasOwn(workspace.locales, localeKey)) {
    locale = structuredClone(workspace.locales[localeKey]);
    locale.key ??= localeKey;
  } else if (typeof localeKey === 'string') {
    locale = await getTemplate(localeKey);
    locale.key ??= localeKey;
  }

  if (typeof localeKey === 'object') {
    locale = structuredClone(localeKey);
  }

  // Failed to getTemplate localeKey.
  if (locale instanceof Error) {
    return locale;
  }

  // Merge the default workspace locale
  if (!parentLocale && locale.key !== 'locale') {
    locale = merge(structuredClone(workspace.locale), locale);
  }

  if (parentLocale) {
    locale.parentRoles = parentLocale.parentRoles.length
      ? parentLocale.parentRoles
      : [parentLocale.role];
  }

  locale = await composeObj(locale, params.user?.roles);

  if (locale instanceof Error) {
    return locale;
  }

  locale.name ??= locale.key;

  locale = mergeParentLocale(locale, parentLocale);

  if (Array.isArray(params.locale) && params.locale.length > 0) {
    // Recursively call getLocale with locale as parentLocale to merge nested locales.
    locale = await getLocale(params, locale);

    // The locale must be returned to prevent processing plugins and layers on a parent locale prior to merging the nested locale.
    return locale;
  }

  if (Array.isArray(locale.plugins)) {
    locale.plugins = locale.plugins.map((plugin) => envReplace(plugin));
  }

  await localeLayers(locale, params);

  return locale;
}

/**
@function mergeParentLocale
@async

@description
Merges a child locale into a parent locale, composing their properties and updating the nested locale structure.

@param {Object} locale The locale object to compose.
@param {Object} [parentLocale] Optional parent locale to merge into.
*/
function mergeParentLocale(locale, parentLocale) {
  if (!parentLocale) {
    return locale;
  }

  const parentClone = structuredClone(parentLocale);

  // Only locales of a nested locales should be used for further nesting.
  delete parentClone.locales;
  delete parentClone.parentRoles;

  parentClone.keys ??= [parentClone.key];
  parentClone.keys.push(locale.key);
  parentClone.name ??= parentClone.key;

  // Compose the nested locale name.
  locale.name = `${parentClone.name}/${locale.name}`;

  if (locale.role) {
    locale.parentRoles.push(locale.role);
  }

  locale = merge(parentClone, locale);

  return locale;
}

async function localeLayers(locale, params) {
  if (!params.layers) {
    return;
  }

  if (!locale.layers) {
    return;
  }

  const layers = [];

  for (const layerKey of Object.keys(locale.layers)) {
    const layer = await getLayer({ ...params, layer: layerKey }, locale);

    if (layer instanceof Error) {
      continue;
    }

    layers.push(layer);
  }

  // Locale layers should be returned as an array.
  locale.layers = layers;
}
