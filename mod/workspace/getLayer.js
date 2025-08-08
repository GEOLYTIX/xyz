/**
## /workspace/getLayer
The getLayer module exports the getLayer method which is required by the query and workspace modules.

@requires /utils/roles
@requires /utils/merge
@requires /workspace/mergeTemplates
@requires /workspace/getLocale
@requires /workspace/getTemplate

@module /workspace/getLayer
*/

import merge from '../utils/merge.js';
import * as Roles from '../utils/roles.js';
import getLocale from './getLocale.js';
import getTemplate from './getTemplate.js';
import mergeTemplates from './mergeTemplates.js';

/**
@function getLayer
@async

@description
A layer will primarily be requested from a locale.

The getLocale method will err if the requesting user does not have access to the locale.

If a layer is not part of a locale an attempt to get the layer directly from the workspace templates will be made.

The locale object can be provided as an additional param. The getLocale method of the workspace API may request any layer in the locale after the locale has already been retrieved. This will prevent a loopback to the locale for every layer in the locale.

The mergeTemplate module will be called to merge templates into the locale object and substitute SRC_* xyzEnvironment variables.

A role check is performed to check whether the requesting user has access to the layer object.

Role objects in the layer are merged with their respective parent objects.

The layer.key and layer.name will be assigned if missing.

The layer.dbs will be assigned from the locale is missing.

Template properties will be removed as these are not required by the MAPP API but only for the composition of workspace objects.

@param {Object} params
@param {locale} [locale] An optional workspace locale can be provided to prevent a roundtrip to the getLocale method.
@property {string} [params.locale] Locale key.
@property {string} [params.layer] Layer key.
@property {Object} [params.user] Requesting user.
@property {Boolean} [params.ignoreRoles] Whether role check should be performed.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Layer.
*/
export default async function getLayer(params, locale) {
  if (!locale) {
    locale = await getLocale(params);
  }

  if (!params.user?.admin) {
    delete params.ignoreRoles;
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

  // layer may be null.
  if (!layer) return;

  // Assign key value as key on layer object.
  layer.key ??= params.layer;

  if (locale.layer) {
    layer = merge(structuredClone(locale.layer), layer);
  }

  //If the user is an admin we don't need to check roles
  if (!params.ignoreRoles && !Roles.check(layer, params.user?.roles)) {
    return new Error('Role access denied.');
  }

  layer = params.user?.admin
    ? Roles.objMerge(layer, params.user?.roles)
    : layer;

  layer = await mergeTemplates(layer, params.user?.roles);

  // Assign layer key as name with no existing name on layer object.
  layer.name ??= layer.key;

  // Assign dbs from locale if nullish on layer.
  layer.dbs ??= locale.dbs;

  // Merge locale.queryparams into layer.
  if (locale.queryparams) {
    layer.queryparams = {
      ...locale.queryparams,
      ...layer.queryparams,
    };
  }

  // Remove properties which are only required for the fetching templates and composing workspace objects.
  delete layer.src;
  delete layer.template;
  delete layer.templates;
  delete layer._type;

  return layer;
}
