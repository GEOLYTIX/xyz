const logger = require('../mod/logger')

const auth = require('../mod/user/auth')

const login = require('../mod/user/login')

const cookie = require('../mod/user/cookie')

const getWorkspace = require('../mod/workspace/getWorkspace')

const routes = {
  layer: require('../mod/layer/_layer'),
  location: require('../mod/location/_location'),
  workspace: require('../mod/workspace/_workspace'),
  user: require('../mod/user/_user'),
  view: require('../mod/view'),
  query: require('../mod/query'),
  gazetteer: require('../mod/gazetteer'),
  provider: provider,
  proxy: proxy,
}

process.env.TITLE = process.env.TITLE || 'GEOLYTIX | XYZ'

process.env.DIR = process.env.DIR || ''

module.exports = async (req, res) => {

  if (IEdetect(req.headers['user-agent'])) return res.send('Uh Oh... It looks like your request comes from an unsupported user agent (e.g. Internet Explorer)')

  // Merge request params and query params.
  req.params = Object.assign(req.params || {}, req.query || {})

  req.params.language = req.params.language || 'en'

  req.params.template = req.params._template || req.params.template

  // Decode string params.
  Object.entries(req.params)
    .filter(entry => typeof entry[1] === 'string')
    .forEach(entry => {
      req.params[entry[0]] = decodeURIComponent(entry[1])
    })

  // Make logger method available through params.
  req.params.logger = logger

  if (req.body && req.body.login) return cookie(req, res)

  if (req.params.login) return login(req, res)

  if (req.params.logout) {

    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

    res.setHeader('location', req.url && decodeURIComponent(req.url).replace(/logout\=true/, ''))

    return res.status(302).send()
  }

  const user = await auth(req, res)

  if (!user && process.env.PRIVATE) return login(req, res)

  req.params.user = user

  const path = req.url.match(/(?<=\/api\/)(.*?)[\/\?]/)

  if (path && path[1] === 'user') {
    const msg = routes.user(req, res)
    msg && login(req, res, msg)
    return
  }

  const workspace = await getWorkspace(req)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  if (req.params.template) {

    const template = workspace.templates[req.params.template]

    if (!template) return res.status(404).send('Template not found.')

    if (template.err) return res.status(500).send(template.err.message)

    if (!user && (template.login || template.admin)) return login(req, res, 'Route requires login')

    if (user && (!user.admin && template.admin)) return login(req, res, 'Route requires admin priviliges')

    req.params.template = template
  }

  req.params.workspace = workspace

  if (path && path[1] && routes[path[1]]) return routes[path[1]](req, res)

  req.params.template = req.params.workspace.templates.mapp

  routes.view(req, res)

}

const https = require('https')

function proxy(req, res) {

  const url = `${req.query.host || ''}${req.query.uri || req.query.url}&${process.env[`KEY_${req.query.provider.toUpperCase()}`]}`

  const proxy = https.request(url, _res => {
    res.writeHead(_res.statusCode, _res.headers)
    _res.pipe(res, {
      end: true
    })
  })

  req.pipe(proxy, {
    end: true
  })
  
}

const _provider = require('../mod/provider')

async function provider(req, res) {

  const provider = _provider[req.params.provider]

  if (!provider) {
    return res.send(`Failed to evaluate 'provider' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/provider/">Provider API</a>`)
  }

  req.body = req.body && await bodyData(req) || null

  const content = await provider(req)

  req.params.content_type && res.setHeader('content-type', req.params.content_type)

  res.send(content)
}

function bodyData(req) {

  return new Promise((resolve, reject) => {

    const chunks = []

    req.on('data', chunk => chunks.push(chunk))

    req.on('end', () => resolve(Buffer.concat(chunks)))

    req.on('error', error => reject(error))

  })
}

function IEdetect(sUsrAg) {
  if (sUsrAg.indexOf("Firefox") > -1) return false

  if (sUsrAg.indexOf("SamsungBrowser") > -1) return false
  
  if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) return false
  
  if (sUsrAg.indexOf("Trident") > -1) return true
}