/**
## /workspace/getLayer
The getLayer module exports the getLayer method which is required by the query and workspace modules.

@requires /utils/roles
@requires /workspace/mergeTemplates
@requires /workspace/getLocale
@requires /workspace/getTemplate

@module /workspace/getLayer
*/

import * as Roles from '../utils/roles.js';

import mergeTemplates from './mergeTemplates.js';

import getLocale from './getLocale.js';

import getTemplate from './getTemplate.js';

/**
@function getLayer
@async

@description
A layer will primarily be requested from a locale.

The getLocale method will err if the requesting user does not have access to the locale.

If a layer is not part of a locale an attemp to get the layer directly from the workspace templates will be made.

The locale object can be provided as an additional param. The getLocale method of the workspace API may request any layer in the locale after the locale has already been retrieved. This will prevent a loopback to the locale for every layer in the locale.

The mergeTemplate module will be called to merge templates into the locale object and substitute SRC_* xyzEnvironment variables.

A role check is performed to check whether the requesting user has access to the layer object.

Role objects in the layer are merged with their respective parent objects.

The layer.key and layer.name will be assigned if missing.

The layer.dbs will be assigned from the locale is missing.

@param {Object} params 
@param {locale} [locale] An optional workspace locale can be provided to prevent a roundtrip to the getLocale method.
@property {string} [params.locale] Locale key.
@property {string} [params.layer] Layer key.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Layer.
*/
export default async function getLayer(params, locale) {
  if (!locale) {
    locale = await getLocale(params);
  }

  // getLocale will return err if role.check fails.
  if (locale instanceof Error) return locale;

  let layer;

  if (Object.hasOwn(locale.layers, params.layer)) {
    layer = locale.layers[params.layer];
  } else {
    // A layer maybe defined as a template only.
    layer = await getTemplate(params.layer);

    if (!layer || layer instanceof Error) {
      return new Error('Unable to validate layer param.');
    }
  }

  // layer maybe null.
  if (!layer) return;

  // Assign key value as key on layer object.
  layer.key ??= params.layer;

  layer = await mergeTemplates(layer);

  if (layer instanceof Error) {
    return layer;
  }

  if (!Roles.check(layer, params.user?.roles)) {
    return new Error('Role access denied.');
  }

  layer = Roles.objMerge(layer, params.user?.roles);

  // Assign layer key as name with no existing name on layer object.
  layer.name ??= layer.key;

  // Assign dbs from locale if nullish on layer.
  layer.dbs ??= locale.dbs;

  return layer;
}
