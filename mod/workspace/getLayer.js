/**
## /workspace/getLayer
The getLayer module exports the getLayer method which is required by the query and workspace modules.

@requires /utils/roles
@requires /workspace/mergeTemplates
@requires /workspace/getLocale

@module /workspace/getLayer
*/

const Roles = require('../utils/roles')

const mergeTemplates = require('./mergeTemplates')

const getLocale = require('./getLocale')

/**
@function getLayer
@async

@description
The layer locale is requested from the getLocale module.

The mergeTemplate module will be called to merge templates into the locale object and substitute SRC_* environment variables.

A role check is performed to check whether the requesting user has access to the locale.

Role objects in the layer are merged with their respective parent objects.

The layer.key and layer.name will be assigned if missing.

@param {Object} params 
@property {string} [params.locale] Locale key.
@property {string} [params.layer] Layer key.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Layer.
*/
module.exports = async function getLayer(params) {

  const locale = await getLocale(params)

  // getLocale will return err if role.check fails.
  if (locale instanceof Error) return locale

  if (!Object.hasOwn(locale.layers, params.layer)) {
    return new Error('Unable to validate layer param.')
  }

  let layer = locale.layers[params.layer]

  // layer maybe null.
  if (!layer) return;

  // Assign key value as key on layer object.
  layer.key ??= params.layer

  layer = await mergeTemplates(layer)

  if (!Roles.check(layer, params.user?.roles)) {
    return new Error('Role access denied.')
  }

  layer = Roles.objMerge(layer, params.user?.roles)

  // Assign layer key as name with no existing name on layer object.
  layer.name ??= layer.key

  // Assign dbs from locale if nullish on layer.
  layer.dbs ??= locale.dbs

  return layer
}
