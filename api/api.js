const logger = require('../mod/logger')

const login = require('../mod/user/login')

const register = require('../mod/user/register')

const auth = require('../mod/user/auth')

const auth0 = require('../mod/user/auth0')

const workspaceCache = require('../mod/workspace/cache')

const proxy = require('../mod/proxy')

const provider = require('../mod/provider/_provider')

const { readFileSync } = require('fs')

const { join } = require('path')

const routes = {
  layer: require('../mod/layer/_layer'),
  location: require('../mod/location/_location'),
  workspace: require('../mod/workspace/_workspace'),
  user: require('../mod/user/_user'),
  view: require('../mod/view'),
  query: require('../mod/query'),
  gazetteer: require('../mod/gazetteer'),
  provider: provider,
}

process.env.COOKIE_TTL = process.env.COOKIE_TTL || 3600

process.env.TITLE = process.env.TITLE || 'GEOLYTIX | XYZ'

process.env.DIR = process.env.DIR || ''

function IEdetect(sUsrAg) {
  if (sUsrAg.indexOf("Firefox") > -1) return false

  if (sUsrAg.indexOf("SamsungBrowser") > -1) return false
  
  if (sUsrAg.indexOf("Opera") > -1 || sUsrAg.indexOf("OPR") > -1) return false
  
  if (sUsrAg.indexOf("Trident") > -1) return true
}

module.exports = async (req, res) => {
    
  console.log(`Got a request with the headers: ${req.headers} and params = ${req.params} and query = ${req.query}`);
    
  // redirect if dir is missing in url path.
  if (process.env.DIR && !req.url.match(process.env.DIR)) {
    res.setHeader('location', `${process.env.DIR}`)
    return res.status(302).send()
  }

  if (req.headers && req.headers['user-agent'] && IEdetect(req.headers['user-agent'])) return res.send('Uh Oh... It looks like your request comes from an unsupported user agent (e.g. Internet Explorer)')

  if (req.url.match(/\/auth0/)) return auth0(req, res)

  // Merge request params and query params.
  req.params = Object.assign(req.params || {}, req.query || {})

  // Url parameter keys must be white listed as letters and numbers only.
  if (Object.keys(req.params).some(key => !key.match(/^[A-Za-z0-9_-]*$/))) {

    return res.status(403).send('Query params validation failed.')
  }

  // Language param will default to english [en] is not explicitly set.
  req.params.language = req.params.language || 'en'

  req.params.template = req.params._template || req.params.template

  // Decode string params.
  Object.entries(req.params)
    .filter(entry => typeof entry[1] === 'string')
    .forEach(entry => {
      req.params[entry[0]] = decodeURIComponent(entry[1])
    })

  // Short circuit login view or post request.
  if (req.params.login || req.body && req.body.login) return login(req, res)

  // Short circuit register view or post request.
  if (req.params.register || req.body && req.body.register) return register(req, res)

  // Short circuit logout request
  if (req.params.logout) {

    // Remove cookie.
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

    // Remove logout parameter.
    res.setHeader('location', req.url && decodeURIComponent(req.url).replace(/logout\=true/, ''))

    return res.status(302).send()
  }

  // Validate signature of either request token or cookie.
  const user = await auth(req, res)

  // Remove token from params object.
  delete req.params.token

  // The authentication method returns an error.
  if (user && user instanceof Error) {

    // Remove cookie.
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)

    // Return login view with error message.
    return login(req, res, user.msg)
  }

  // Set user as request parameter.
  req.params.user = user

  // Retrieve path component from request URL for method routing.
  const path = req.url.match(/(?<=\/api\/)(.*?)[\/\?]/)

  // Short circuit proxy requests.
  if (path && path[0] === 'proxy?') return proxy(req, res)

  // Short circuit proxy requests.
  if (path && path[1] === 'provider') return provider(req, res)

  // The user path will short circuit since workspace or templates are not required.
  if (path && path[1] === 'user') {

    // A msg will be returned if the user does not met the required priviliges.
    const msg = routes.user(req, res)

    // Return the login view with the msg.
    msg && login(req, res, msg)
    return
  }

  // The login view will be returned for all PRIVATE requests without a valid user.
  if (!user && process.env.PRIVATE) return login(req, res)

  // Retrieve workspace and assign to request params.
  const workspace = await workspaceCache(req)

  if (workspace instanceof Error) return res.status(500).send(workspace.message)

  req.params.workspace = workspace

  // Retrieve query or view template from workspace
  if (req.params.template) {

    const template = workspace.templates[req.params.template]

    if (!template) return res.status(404).send('Template not found.')

    if (template.err) return res.status(500).send(template.err.message)

    if (!user && (template.login || template.admin)) return login(req, res, 'Route requires login')

    if (user && (!user.admin && template.admin)) return login(req, res, 'Route requires admin priviliges')

    req.params.template = template
  }
  
  if (path && path[1] && routes[path[1]]) return routes[path[1]](req, res)

  // Assign the mapp template as default if no template is set.
  req.params.template = req.params.template || req.params.workspace.templates && req.params.workspace.templates.default

  if (!req.params.template) {
    const template = readFileSync(join(__dirname, '../public/views/_default.html')).toString('utf8')
    req.params.template = {
      template: template,
      render: params => template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')
    }
  }

  // Return the View API on the root.
  routes.view(req, res)
}