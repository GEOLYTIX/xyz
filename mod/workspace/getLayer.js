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

  const layer = locale.layers[params.layer]

  // Assign key value as key on layer object.
  layer.key ??= params.layer

  if (Object.hasOwn(workspace.templates, layer.template || layer.key)) {

    merge(layer, await getTemplate(workspace.templates[layer.template || layer.key]))
  }

  if (Array.isArray(layer.templates)) {

    // Merge templates from templates array into layer.
    layer.templates.forEach(async template => {
      merge(layer, await getTemplate(workspace.templates[template]))
    })
  }

  // Check for layer geom[s].
  if ((layer.table || layer.tables) && (!layer.geom && !layer.geoms)) {

    console.warn(`Layer: ${layer.key},has a table or tables defined, but no geom or geoms.`)
  }

  // Assign layer key as name with no existing name on layer object.
  layer.name ??= layer.key

  return layer
}