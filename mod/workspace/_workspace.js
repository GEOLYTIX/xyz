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

async function getLayer(req, res) {

  const roles = req.params.user && req.params.user.roles || []

  if (!req.params.layer) return res.send('Layer key missing.')

  const locale = req.params.locale && req.params.workspace.locales[req.params.locale]

  if (locale && locale.roles && !Object.keys(locale.roles).some(
    role => roles.includes(role)
      || (role.match(/^\!/) && !roles.includes(role.replace(/^\!/, '')))
  )) return res.status(403).send('Role access denied.')

  let layer = locale && locale.layers[req.params.layer] ||  req.params.workspace.templates[req.params.layer]

  if (!layer) return res.status(400).send('Layer not found.')

  if (layer.roles && !Object.keys(layer.roles).some(
    role => roles.includes(role)
      || (role.match(/^\!/) && !roles.includes(role.replace(/^\!/, '')))
  )) return res.status(403).send('Role access denied.')

  if (roles.length) {
    layer = await roleEval(layer, roles)
  }

  res.send(layer)
}

function getTemplate(req, res) {

  if (!req.params.template) return res.status(400).send('Template not found.')

  res.setHeader('content-type', 'text/plain')

  res.send(req.params.template.err && req.params.template.err.message
    || req.params.template)
}

function getTemplates(req, res) {

  const host = `${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${process.env.DIR}`

  const templates = Object.entries(req.params.workspace.templates).map(
    template => `<a ${template[1].err && 'style="color: red;"' ||''} href="${host}/api/workspace/get/template?template=${template[0]}">${template[0]}</a>`
  )

  res.send(templates.join('<br>'))
}

function getLocales(req, res) {

  if (!req.params.workspace.locales) return res.send({})

  const locales = Object.keys(req.params.workspace.locales).map(key => {

    const locale = req.params.workspace.locales[key]

    const roles = req.params.user && req.params.user.roles || []

    // Locales without roles will always be returned.
    if (!locale.roles) return {
      key: key,
      name: locale.name || key
    }

    // Check for negative roles
    if (Object.keys(locale.roles).some(

      // Locales with a negated role will not be returned if that role is property of the locale roles.
      role => role.match(/^\!/) && roles.includes(role.replace(/^\!/, ''))
    )) return;

    // Check for positive roles
    if (roles && Object.keys(locale.roles).some(
      role => roles.includes(role)
    )) return {
      key: key,
      name: locale.name || key
    }

  // Filter out the locales which are undefined after role checks.
  }).filter(locale => typeof locale !== "undefined")

  res.send(locales)

}

function getLocale(req, res) {

  if (!req.params.locale) return res.send('Locale key missing.')

  if (!req.params.workspace.locales[req.params.locale]) return res.status(400).send('Locale not found.')

  let locale = Object.assign({key: req.params.locale}, cloneDeep(req.params.workspace.locales[req.params.locale]))

  const roles = req.params.user && req.params.user.roles || []

  if(locale.roles && !Object.keys(locale.roles).some(
    role => roles.includes(role) 
    || ((role.match(/^\!/) && !roles.includes(role.replace(/^\!/, ''))))
    )) return res.status(403).send('Role access denied.')

  locale.layers = Object.entries(locale.layers)
    .map(layer => {

      if (!layer[1].roles) return layer[0]

      // check whether the layer is available for roles in token.
      if (roles.length && Object.keys(layer[1].roles).some(
        role => roles.includes(role)
          || (role.match(/^\!/) && !roles.includes(role.replace(/^\!/, '')))
      )) return layer[0]
      
    })
    .filter(layer => !!layer)

  res.send(locale)
}

async function roleEval(check, roles) {

  (function objectEval(o, parent, key) {

    // check whether the object has an access key matching the current level.
    if (Object.entries(o).some(
      e => e[0] === 'roles' && !Object.keys(e[1]).some(
        role => roles.includes(role) || (role.match(/^\!/) && !roles.includes(role.replace(/^\!/, '')))
      )
    )) {

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

  return check
}