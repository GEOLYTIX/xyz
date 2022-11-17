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

  if (keys[req.params.key]) return keys[req.params.key](req, res)

  res.send(`
    Failed to evaluate 'key' param.<br><br>
    <a href="https://github.com/GEOLYTIX/xyz/wiki/XYZ---API#workspacekey">Workspace API</a>`)
}

async function getLayer(req, res) {

  if (!req.params.layer) return res.status(400).send('Layer param missing.')

  if (!req.params.locale) return res.status(400).send('Locale param missing.')

  const roles = req.params.user && req.params.user.roles || []

  const locale = req.params.workspace.locales[req.params.locale]

  if (!locale) return res.status(404).send('Locale not found.')

  if (!Roles.check(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  const layer = clone(locale.layers[req.params.layer])

  if (!layer) return res.status(404).send('Layer not found.')

  if (!Roles.check(layer, roles)) {
    return res.status(403).send('Role access denied.')
  }

  await Roles.reduce(layer, roles)

  res.send(layer)
}

function getLocales(req, res) {

  if (!req.params.workspace.locales) return res.send({})

  const roles = req.params.user && req.params.user.roles || []

  const locales = Object.values(req.params.workspace.locales)
    .filter(locale => !!Roles.check(locale, roles))
    .map(locale => ({
      key: locale.key,
      name: locale.name
    }))

  res.send(locales)
}

function getLocale(req, res) {

  if (!req.params.locale) {
    return res.status(400).send('Locale key missing.')
  }

  if (!req.params.workspace.locales[req.params.locale]) {
    return res.status(404).send('Locale not found.')
  }

  const locale = clone(req.params.workspace.locales[req.params.locale])

  const roles = req.params.user && req.params.user.roles || []

  if (!Roles.check(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  locale.layers = Object.entries(locale.layers)
    .filter(layer => !!Roles.check(layer[1], roles))
    .map(layer => layer[0])

  res.send(locale)
}

function getRoles(req, res) {

  if (!req.params.workspace.locales) return res.send({})

  let roles = Roles.get(req.params.workspace)

  res.send(roles)
}

function getTemplates(req, res) {

  res.send(Object.keys(req.params.workspace.templates))
}