const cloneDeep = require('lodash/cloneDeep')

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
    .filter(locale => !!checkRoles(locale, roles))
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

  if (!checkRoles(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  locale.layers = Object.entries(locale.layers)
    .filter(layer => !!checkRoles(layer[1], roles))
    .map(layer => layer[0])

  res.send(locale)
}

function checkRoles(check, roles) {

  if (!check.roles) return check

  if (!roles) return false

  // Check whether negated role is matched with user.
  const someNegatedRole = Object.keys(check.roles)
    .some(role => role.match(/^\!/) && roles.includes(role.replace(/^\!/, "")))

  // Return undefined if some negated role is matched.
  if (someNegatedRole) return false
  
  // Check whether every role is negated.
  const everyNegatedRoles = Object.keys(check.roles)
    .every(role => role.match(/^\!/))
  
  // Return locale if every role is negated.
  if (everyNegatedRoles) return check
  
  // Check if some positive role is matched.
  const somePositiveRole = Object.keys(check.roles)
    .some(role => roles.includes(role))
  
  // Return locale if some positive role is matched.
  if (somePositiveRole) return check
  
  return false
}

async function getLayer(req, res) {

  if (!req.params.layer) return res.status(400).send('Layer param missing.')

  if (!req.params.locale) return res.status(400).send('Locale param missing.')

  const roles = req.params.user && req.params.user.roles || []

  const locale = req.params.workspace.locales[req.params.locale]

  if (!locale) return res.status(404).send('Locale not found.')

  if (!checkRoles(locale, roles)) {
    return res.status(403).send('Role access denied.')
  }

  const layer = cloneDeep(locale.layers[req.params.layer])

  if (!layer) return res.status(404).send('Layer not found.')

  if (!checkRoles(layer, roles)) {
    return res.status(403).send('Role access denied.')
  }

  await roleEval(layer, roles)

  res.send(layer)
}

async function roleEval(check, roles) {

  if (!roles) return

  (function objectEval(o, parent, key) {

    if (!checkRoles(o, roles)) {
      // if the parent is an array splice the key index.
      if (parent.length > 0) return parent.splice(parseInt(key), 1)

      // if the parent is an object delete the key from the parent.
      return delete parent[key]
    }

    // iterate through the object tree.
    Object.keys(o).forEach((key) => {
      if (o[key] && typeof o[key] === 'object') objectEval(o[key], o, key)
    });

  })(check)

}