const clone = require('../utils/clone.js')

const Roles = require('../utils/roles.js')

module.exports = async (req, res) => {

  const keys = {
    defaults: () => res.send(defaults),
    layer: getLayer,
    locale: getLocale,
    locales: getLocales,
    roles: getRoles,
    templates: getTemplates,
    timestamp: () => res.send(req.params.workspace.timestamp.toString()),
  }

  // The keys object must own a user provided lookup key
  if (!Object.hasOwn(keys, req.params.key)) {

    return res.send(`
      Failed to evaluate 'key' param.<br><br>
      <a href="https://github.com/GEOLYTIX/xyz/wiki/XYZ---API#workspacekey">Workspace API</a>`)
  }

  return keys[req.params.key](req, res)
}

async function getLayer(req, res) {

  if (!Object.hasOwn(req.params.workspace.locales, req.params.locale)) {
    return res.status(400).send(`Unable to validate locale param.`)
  }

  const locale = req.params.workspace.locales[req.params.locale]

  const roles = req.params.user?.roles || []

  if (!Roles.check(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  if (!Object.hasOwn(locale.layers, req.params.layer)) {
    return res.status(400).send(`Unable to validate layer param.`)
  }

  const layer = clone(locale.layers[req.params.layer])

  if (!Roles.check(layer, roles)) {
    return res.status(403).send('Role access denied.')
  }

  await Roles.reduce(layer, roles)

  res.json(layer)
}

function getLocales(req, res) {

  const roles = req.params.user?.roles || []

  const locales = Object.values(req.params.workspace.locales)
    .filter(locale => !!Roles.check(locale, roles))
    .map(locale => ({
      key: locale.key,
      name: locale.name
    }))

  res.send(locales)
}

function getLocale(req, res) {

  if (req.params.locale && !Object.hasOwn(req.params.workspace.locales, req.params.locale)) {
    return res.status(400).send(`Unable to validate locale param.`)
  }

  const locale = clone(req.params.workspace.locales?.[req.params.locale] || req.params.workspace.locale || {})

  const roles = req.params.user?.roles || []

  if (!Roles.check(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  // Check layer access.
  locale.layers = locale.layers && Object.entries(locale.layers)
    .filter(layer => !!Roles.check(layer[1], roles))
    .map(layer => layer[0])

  res.json(locale)
}

function getRoles(req, res) {

  if (!req.params.workspace.locales) return res.send({})

  let roles = Roles.get(req.params.workspace)

  res.send(roles)
}

function getTemplates(req, res) {

  res.send(Object.keys(req.params.workspace.templates))
}