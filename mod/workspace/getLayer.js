/**
## /workspace/getLayer
The getLayer module exports the getLayer method which is required by the query and workspace modules.

The workspace is cached in the module scope to allow for the mergeObjectTemplates(layer) method to assign template objects defined in a JSON layer to the workspace.templates{}.

@requires /utils/roles
@requires /workspace/mergeTemplates
@requires /workspace/cache
@requires /workspace/getLocale

@module /workspace/getLayer
*/

const Roles = require('../utils/roles')

const mergeTemplates = require('./mergeTemplates')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

let workspace

/**
@function getLayer
@async

@description
The layer locale is requested from the getLocale module.

The layer object from the locale will be merged into a layer template matching the layer key.

An array layer templates defined in the layer.templates[] will be merged into the layer object.

A role check is performed to check whether the requesting user has access to the locale.

Role objects in the layer are merged with their respective parent objects.

${*} template parameter are substituted with values from SRC_* environment variables.

The layer.key and layer.name will be assigned if missing.

The mergeObjectTemplates(layer) method will be called.

@param {Object} params 
@property {string} [params.locale] Locale key.
@property {string} [params.layer] Layer key.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.

@returns {Promise<Object|Error>} JSON Layer.
*/
module.exports = async function getLayer(params) {

  workspace = await workspaceCache()

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

  return layer
}
