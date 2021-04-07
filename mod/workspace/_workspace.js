const cloneDeep = require('lodash/cloneDeep')

const Roles = require('../roles.js')

module.exports = async (req, res) => {

  const keys = {
    defaults: () => res.send(defaults),
    timestamp: () => res.send(req.params.workspace.timestamp.toString()),
    layer: getLayer,
    template: getTemplate,
    templates: getTemplates,
    locale: getLocale,
    locales: getLocales,
  }

  if (!req.params.key) return res.send(req.params.workspace)

  if (keys[req.params.key]) return keys[req.params.key](req, res)

  res.send(`
    Failed to evaluate 'key' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/workspace/">Workspace API</a>`)
}

function getTemplates(req, res) {

  const host = `${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${process.env.DIR}`

  const templates = Object.entries(req.params.workspace.templates).map(
    template => `<a ${template[1].err && 'style="color: red;"' || ''} href="${host}/api/workspace/get/template?template=${template[0]}">${template[0]}</a>`
  )

  res.send(templates.join('<br>'))
}

function getTemplate(req, res) {

  if (!req.params.template) return res.status(404).send('Template not found.')

  res.setHeader('content-type', 'text/plain')

  res.send(req.params.template.err && req.params.template.err.message
    || req.params.template)
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

  const locale = cloneDeep(req.params.workspace.locales[req.params.locale])

  const roles = req.params.user && req.params.user.roles || []

  if (!Roles.check(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  locale.layers = Object.entries(locale.layers)
    .filter(layer => !!Roles.check(layer[1], roles))
    .map(layer => layer[0])

  res.send(locale)
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

  const layer = cloneDeep(locale.layers[req.params.layer])

  if (!layer) return res.status(404).send('Layer not found.')

  if (!Roles.check(layer, roles)) {
    return res.status(403).send('Role access denied.')
  }

  await Roles.reduce(layer, roles)

  res.send(layer)
}