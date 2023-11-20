const Roles = require('../utils/roles')

const merge = require('../utils/merge')

const workspaceCache = require('./cache')

const getLocale = require('./getLocale')

const getTemplate = require('./getTemplate')

module.exports = async (params) => {

  const workspace = await workspaceCache()

  if (!Object.hasOwn(workspace.locales, params.locale)) {
    return new Error('Unable to validate locale param.')
  }

  const locale = await getLocale(params)

  if (locale instanceof Error) {

    return locale
  }

  const roles = params.user?.roles || []

  if (!Roles.check(locale, roles)) {
    return new Error('Role access denied.')
  }

  if (!Object.hasOwn(locale.layers, params.layer)) {
    return new Error('Unable to validate layer param.')
  }

  let layer = locale.layers[params.layer]

  // Assign key value as key on layer object.
  layer.key ??= params.layer

  if (Object.hasOwn(workspace.templates, layer.template || layer.key)) {

    // Merge the workspace template into the layer.
    layer =  merge(await getTemplate(workspace.templates[layer.template || layer.key]), layer)
  }

  // If we have an array of templates in the layer object, merge them into the layer.
  if (Array.isArray(layer.templates)) for (const key of layer.templates){

    let template = Object.hasOwn(workspace.templates, key) && await getTemplate(workspace.templates[key])
      
    // Merge the layer into the template
    layer = merge(layer, template)
  }

  // Check for layer geom[s].
  if ((layer.table || layer.tables) && (!layer.geom && !layer.geoms)) {

    console.warn(`Layer: ${layer.key},has a table or tables defined, but no geom or geoms.`)
  }

  // Assign layer key as name with no existing name on layer object.
  layer.name ??= layer.key

  return layer
}