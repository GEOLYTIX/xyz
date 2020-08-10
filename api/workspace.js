const auth = require('../mod/user/auth')

const _method = {
  cache: {
    handler: cache,
    access: 'admin_workspace'
  },
  get: {
    handler: get
  }
}

const getWorkspace = require('../mod/workspace/getWorkspace')

const fetch = require('node-fetch')

const cloneDeep = require('lodash/cloneDeep')

let host, workspace

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  const method = _method[req.params && req.params.method]

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/workspace/">Workspace API</a>`)
  }

  await auth(req, res, method.access)

  if (res.finished) return

  host = `${req.headers.host.includes('localhost') && 'http' || 'https'}://${req.headers.host}${process.env.DIR || ''}`

  method.handler(req, res)
}

async function cache(req, res) {

  workspace = await getWorkspace(true)

  if (workspace instanceof Error) return res.status(500).send(`<span style="color: red;">${workspace.message}</span>`)

  Promise.all([
    fetch(`${host}/view?cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/query?cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/gazetteer?cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/layer?cache=true&token=${req.params.token.signed}`),
    fetch(`${host}/api/location?cache=true&token=${req.params.token.signed}`),
  ]).then(arr => {
    if (arr.some(response => !response.ok)) return res.status(500).send('Failed to cache workspace.')

    const errormessages = Object.values(workspace.templates)
      .filter(template => template.err)
      .map(template => `<span style="color: red;">${template.err}</span>`)

    res.send(`Workspace cached.<br><br>${errormessages.join('<br>')}`)
  })
}

async function get(req, res) {

  workspace = await getWorkspace()

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  const keys = {
    defaults: () => res.send(defaults),
    layer: getLayer,
    template: getTemplate,
    templates: getTemplates,
    locale: getLocale,
    locales: getLocales,
    cloudfront: cloudfront,
  }

  if (!req.params.key) return res.send(workspace)

  if (keys[req.params.key]) return keys[req.params.key](req, res)

  res.send(`Failed to evaluate ${req.params.key} as 'key' param.<br><br>
  <a href="https://geolytix.github.io/xyz/docs/develop/api/workspace/">Workspace API</a>`)
}

const cfsign = require('aws-cloudfront-sign')

const { join } = require('path')

async function cloudfront(req, res) {

  var signingParams = {
    keypairId: process.env.KEY_CLOUDFRONT,
    privateKeyPath: join(__dirname, `../${process.env.KEY_CLOUDFRONT}.pem`),
    // expireTime: 1426625464599
  }

  var signedUrl = cfsign.getSignedUrl(
    'https://www.geolytix.io/aldi/workspace.json', 
    signingParams
  )

  const response = await fetch(signedUrl)

  if (response.status >= 300) return res.send('err')

  const ws = await response.json()

  res.send(ws)

}

async function getLayer(req, res) {

  if (!req.params.layer) return res.send('Layer key missing.')

  const locale = req.params.locale && workspace.locales[req.params.locale]

  if (locale.roles && !Object.keys(locale.roles).some(
    role => req.params.token
      && req.params.token.roles
      && req.params.token.roles.includes(role)
  )) return res.status(403).send('Role access denied.')

  let layer = locale && locale.layers[req.params.layer] ||  workspace.templates[req.params.layer]

  if (!layer) return res.status(400).send('Layer not found.')

  if (layer.roles && !Object.keys(layer.roles).some(
    role => req.params.token
      && req.params.token.roles
      && req.params.token.roles.includes(role)
  )) return res.status(403).send('Role access denied.')

  if (req.params.token && req.params.token.roles) {
    layer = await roleEval(layer, req.params.token.roles)
  }

  res.send(layer)
}

function getTemplate(req, res) {

  if (!req.params.template) return res.send('Template key missing.')

  const template = workspace.templates[req.params.template];

  if (!template) return res.status(400).send('Template not found.')

  res.setHeader('content-type', 'text/plain')

  res.send(template.err && template.err.message
    || template.template
    || template.render && template.render.toString()
    || template)
}

function getTemplates(req, res) {

  const templates = Object.entries(workspace.templates).map(
    template => `<a ${template[1].err && 'style="color: red;"' ||''} href="${host}/api/workspace/get/template?template=${template[0]}">${template[0]}</a>`
  )

  res.send(templates.join('<br>'))
}

function getLocales(req, res) {

  if (!workspace.locales) return res.send({})

  const locales = Object.keys(workspace.locales).map(key => {

    const locale = workspace.locales[key]

    if (!locale.roles) return key

    if (Object.keys(locale.roles).some(
      role => req.params.token
        && req.params.token.roles
        && req.params.token.roles.includes(role)
    )) return key

  }).filter(key => typeof key ==='string')

  res.send(locales)

}

function getLocale(req, res) {

  if (!req.params.locale) return res.send('Locale key missing.')

  if (!workspace.locales[req.params.locale]) return res.status(400).send('Locale not found.')

  let locale = Object.assign({key: req.params.locale}, cloneDeep(workspace.locales[req.params.locale]))

  if (locale.roles && !Object.keys(locale.roles).some(
    role => req.params.token
      && req.params.token.roles
      && req.params.token.roles.includes(role)
  )) return res.status(403).send('Role access denied.')

  locale.layers = Object.entries(locale.layers)
    .map(layer => {

      if (!layer[1].roles) return layer[0]

      // check whether the layer is available for roles in token.
      if (Object.keys(layer[1].roles).some(
        role => req.params.token
          && req.params.token.roles
          && req.params.token.roles.includes(role)
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
        role => roles.includes(role)
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