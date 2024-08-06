/**
@module /workspace/getLayer
*/

const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getTemplate = require('./template')

let workspace

module.exports = async (params) => {

  workspace = await workspaceCache()

  // Set locale as default
  params.locale ??= 'locale'

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

  if (layerTemplate) {

    if (layerTemplate instanceof Error) {

      // A layer may not have a template 
    } else {

      // Merge layer --> template
      layer = merge(layerTemplate, layer)
    }
  }

  // Merge templates --> layer
  for (const template_key of layer.templates || []){

    const layerTemplate = await getTemplate(template_key)

    if (layerTemplate) {
  
      if (layerTemplate instanceof Error) {
  
        return layerTemplate
      } else {
  
        layer = merge(layer, layerTemplate)
      }
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