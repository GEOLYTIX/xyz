const Roles = require('../utils/roles.js')

const merge = require('../utils/merge')

const getTemplate = require('./getTemplate')

const workspaceCache = require('./cache')

module.exports = async (req) => {

  const workspace = await workspaceCache()

  if (!Object.hasOwn(workspace.locales, req.params.locale)) {
    return new Error('Unable to validate locale param.') //400
  }

  const locale = workspace.locales[req.params.locale]

  const roles = req.params.user?.roles || []

  if (!Roles.check(locale, roles)) {
    return new Error('Role access denied.') //403
  }

  if (!Object.hasOwn(locale.layers, req.params.layer)) {
    return new Error('Unable to validate layer param.') //400
  }

  const layer = locale.layers[req.params.layer]

  // Assign key value as key on layer object.
  layer.key ??= req.params.layer

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

  //const layer = clone(locale.layers[req.params.layer])

  // if (!Roles.check(layer, roles)) {
  //   return res.status(403).send('Role access denied.')
  // }

  return layer
}