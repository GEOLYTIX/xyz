const logger = require('../mod/utils/logger')

const login = require('../mod/user/login')

const register = require('../mod/user/register')

const auth = require('../mod/user/auth')

const saml = process.env.SAML_ENTITY_ID && require('../mod/user/saml')

const workspaceCache = require('../mod/workspace/cache')

const routes = {
  gazetteer: require('../mod/gazetteer'),
  layer: require('../mod/layer/_layer'),
  location: require('../mod/location/_location'),
  provider: require('../mod/provider/_provider'),
  proxy: require('../mod/proxy'),
  query: require('../mod/query'),
  module: require('../mod/module'),
  user: require('../mod/user/_user'),
  view: require('../mod/view'),
  workspace: require('../mod/workspace/_workspace'),
}

process.env.COOKIE_TTL = process.env.COOKIE_TTL || 36000

process.env.TITLE = process.env.TITLE || 'GEOLYTIX | XYZ'

process.env.DIR = process.env.DIR || ''

function IEdetect(sUsrAg) {
  if (sUsrAg.indexOf('Firefox') > -1) return false

  if (sUsrAg.indexOf('SamsungBrowser') > -1) return false
  
  if (sUsrAg.indexOf('Opera') > -1 || sUsrAg.indexOf('OPR') > -1) return false
  
  if (sUsrAg.indexOf('Trident') > -1) return true
}

module.exports = async (req, res) => {

  // redirect if dir is missing in url path.
  if (process.env.DIR && !req.url.match(process.env.DIR)) {
    res.setHeader('location', `${process.env.DIR}`)
    return res.status(302).send()
  }

  if (req.headers && req.headers['user-agent'] && IEdetect(req.headers['user-agent'])) return res.send('Uh Oh... It looks like your request comes from an unsupported user agent (e.g. Internet Explorer)')

  logger(req, 'req')

  logger(req.url, 'req_url')

  // Request will be short circuited to the saml module.
  if (req.url.match(/\/saml/)) {
    if (!saml) return;
    return saml(req, res)
  }

  // Merge request params and query params.
  req.params = Object.assign(req.params || {}, req.query || {})

  Object.keys(req.params).forEach(key => {

    // Make null string params null.
    if (req.params[key]?.toLowerCase() === 'null') {
      req.params[key] = null
    }

    // Delete param keys with undefined values.
    if (req.params[key] === undefined) {
      delete req.params[key]
    }
  })

  // Url parameter keys must be white listed as letters and numbers only.
  if (Object.keys(req.params).some(key => !key.match(/^[A-Za-z0-9_-]*$/))) {

    return res.status(403).send('URL parameter key validation failed.')
  }

  // Check for array URL parameter
  Object.keys(req.params).forEach(key => {
    
    // Return if parameter isn't braced square.
    if(!req.params[key]?.match(/^[\[].*[\]]$/)) return;

    // Slice square brackets of string and split on comma.
    req.params[key] = req.params[key].slice(1, -1).split(',')

  })

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
    res.setHeader('location', '/')

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

  // Proxy route
  if (req.url.match(/(?<=\/api\/proxy)/)) {
    return routes.proxy(req, res)
  }

  // Provider route
  if (req.url.match(/(?<=\/api\/provider)/)) {
    return routes.provider(req, res)
  }

  // User route
  if (req.url.match(/(?<=\/api\/user)/)) {

    // A msg will be returned if the user does not met the required priviliges.
    const msg = routes.user(req, res)

    // Return the login view with the msg.
    msg && login(req, res, msg)
    return
  }

  // The login view will be returned for all PRIVATE requests without a valid user.
  if (!user && process.env.PRIVATE) {

    if (process.env.SAML_LOGIN) {
      res.setHeader('location', `${process.env.DIR}/saml/login`)
      return res.status(302).send()
    }

    return login(req, res)
  }

  // Retrieve workspace and assign to request params.
  const workspace = await workspaceCache(req)

  if (workspace instanceof Error) {
    return res.status(500).send(workspace.message)
  }

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

  // Gazetteer route
  if (req.url.match(/(?<=\/api\/gazetteer)/)) {
    return routes.gazetteer(req, res)
  }

  // Layer route
  if (req.url.match(/(?<=\/api\/layer)/)) {
    return routes.layer(req, res)
  }

  // Location route
  if (req.url.match(/(?<=\/api\/location)/)) {
    return routes.location(req, res)
  }  

  // Query route
  if (req.url.match(/(?<=\/api\/query)/)) {
    return routes.query(req, res)
  }

  // Module route
  if (req.url.match(/(?<=\/api\/module)/)) {
    return routes.module(req, res)
  }  

  // Workspace route
  if (req.url.match(/(?<=\/api\/workspace)/)) {
    return routes.workspace(req, res)
  }

  // Return the View API on the root.
  routes.view(req, res)
}