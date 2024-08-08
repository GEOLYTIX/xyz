/**
## /workspace/getLayer
The getLayer module exports the getLayer method which is required by the query and workspace modules.

The workspace is cached in the module scope to allow for the mergeObjectTemplates(layer) method to assign template objects defined in a JSON layer to the workspace.templates{}.

@requires /utils/roles
@requires /utils/merge
@requires /workspace/cache
@requires /workspace/getLocale
@requires /workspace/getTemplate

@module /workspace/getLayer
*/

const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getTemplate = require('./getTemplate')

let workspace

/**
@function getLayer
@async

@description
The layer locale is requested from the getLocale module.

The layer object from the locale will be merged into a layer template matching the layer key.

An array layer templates defined in the layer.templates[] will be merged into the layer object.

A role check is performed to check whether the requesting user has access to the locale.

${*} template parameter are substituted with values from SRC_* environment variables.

The layer.key and layer.name will be assigned if missing.

The mergeObjectTemplates(layer) method will be called.

@param {Object} params 
@property {string} [params.locale] Locale key.
@property {string} [params.layer] Layer key.
@property {Object} [params.user] Requesting user.
@property {Array} [user.roles] User roles.

@returns {Object} JSON Layer.
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

  const layerTemplate = await getTemplate(layer.template || layer.key)

  if (layerTemplate && !(layerTemplate instanceof Error)) {

    // Merge layer --> template
    layer = merge(layerTemplate, layer)
  }

  // Merge templates --> layer
  for (const template_key of layer.templates || []){

    const layerTemplate = await getTemplate(template_key)

    if (layerTemplate && !(layerTemplate instanceof Error)) {

      // Merge template --> layer
      layer = merge(layer, layerTemplate)
    }
  }

  if (!Roles.check(layer, params.user?.roles)) {
    return new Error('Role access denied.')
  }

  // Subtitutes ${*} with process.env.SRC_* key values.
  layer = JSON.parse(
    JSON.stringify(layer).replace(/\$\{(.*?)\}/g,
      matched => {
        const SRC_x = `SRC_${matched.replace(/(^\${)|(}$)/g, '')}`
        return Object.hasOwn(process.env, SRC_x)
          ? process.env[SRC_x]
          : matched
      })
  )
  
  // Assign layer key as name with no existing name on layer object.
  layer.name ??= layer.key

  mergeObjectTemplates(layer)

  return layer
}

/**
@function mergeObjectTemplates

@description
The method parses an object for a template object property. The template property value will be assigned to the workspace.templates{} object matching the template key value.

The method will call itself for nested objects.

@param {Object} obj 
*/
function mergeObjectTemplates(obj) {

  if (obj === null) return;

  if (obj instanceof Object && !Object.keys(obj)) return;

  Object.entries(obj).forEach(entry => {

    if (entry[0] === 'template' && entry[1].key) {

      workspace.templates[entry[1].key] = Object.assign(workspace.templates[entry[1].key] || {}, entry[1])

      return;
    }

    if (Array.isArray(entry[1])) {

      entry[1].forEach(mergeObjectTemplates)
      return;
    }

    if (entry[1] instanceof Object) {

      Object.values(entry[1])?.forEach(mergeObjectTemplates)
    }

  })
}
