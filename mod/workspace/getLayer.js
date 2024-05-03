/**
@module /workspace/getLayer
*/

const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getTemplate = require('./getTemplate')

module.exports = async (params) => {

  const workspace = await workspaceCache()

  if (workspace instanceof Error) {
    return workspace
  }

  if (!Object.hasOwn(workspace.locales, params.locale)) {
    return new Error('Unable to validate locale param.')
  }

  const locale = await getLocale(params)

  if (locale instanceof Error) return locale

  const roles = params.user?.roles || []

  if (!Roles.check(locale, roles)) {
    return new Error('Role access denied.')
  }

  if (!Object.hasOwn(locale.layers, params.layer)) {
    return new Error('Unable to validate layer param.')
  }

  let layer = locale.layers[params.layer]

  // layer maybe null or undefined.
  if (!layer) return;

  // Return already merged layer.
  if (layer.merged) return layer

  // Assign key value as key on layer object.
  layer.key ??= params.layer

  // Merge layer --> template
  if (Object.hasOwn(workspace.templates, layer.template || layer.key)) {

    let template = structuredClone(await getTemplate(workspace.templates[layer.template || layer.key]))

    // Merge the workspace template into the layer.
    layer =  merge(template, layer)
  }

  // Merge templates --> layer
  for (const key of layer.templates || []){

    if (!Object.hasOwn(workspace.templates, key)) continue;

    let template =  structuredClone(await getTemplate(workspace.templates[key]))
     
    // Merge the workspace template into the layer.
    layer = merge(layer, template)
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

  layer.merged = true

  return layer
}