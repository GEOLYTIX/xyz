/**
## XYZ API

The XYX API module exports the api function which serves as the entry point for all XYZ API requests.

A node.js express app will require the api module and reference the exported api method for all request routes.

```js
const app = express()
const api = require('./api/api')
app.get(`/`, api)
```

@requires /fetch
@requires /query
@requires /view
@requires /provider
@requires /sign
@requires /user
@requires /workspace
@requires /user/login
@requires /user/auth
@requires /user/saml
@requires /user/register
@requires /utils/logger
@module /api
*/

/**
@global
@typedef {Object} req
The req object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on.
@property {Object} params HTTP request parameter.
@property {Object} [body] HTTP POST request body.
@property {Object} header HTTP request header.
*/

/**
@global
@typedef {Object} res
The res object represents the HTTP response that an [Express] app sends when it gets an HTTP request.
*/

/**
@global
@typedef {Object} env
The process.ENV object holds configuration provided to the node process from the launch environment. The environment configuration allows the provision of keys and secrets which must not be accessible from the client. All env properties are limited to string type.
@property {String} [DIR=''] The XYZ API path which concatenated with the domain for all requests.
@property {String} [PORT='3000'] The port on which the express app listens to for requests.
@property {String} [COOKIE_TTL='36000'] The Time To Live for all cookies issued by the XYZ API.
@property {String} [TITLE='GEOLYTIX | XYZ'] The TITLE value is used to identify cookies and is provided to as a param to Application View templates.
@property {String} [LOGS] The LOGS string will split on comma to determine which requests send to the [LOGGER]{@link module:/utils/logger} module will be logged.
@property {String} [LOGGER] Required to configure the [LOGGER]{@link module:/utils/logger} module for a remote out.
@property {String} [PRIVATE] All requests to XYZ API require authentication. The PRIVATE value represents the ACL connection.
@property {String} [PUBLIC] General requests to XYZ API do require authentication. The PUBLIC value represents an ACL connection for optional authentication.
@property {String} [SECRET] A secret string is required to sign and [validate JWT]{@link module:/user/auth}.
@property {String} [USER_SESSION] The [auth module]{@link module:/user/auth} will store and check a session key if the USER_SESSION env is not undefined.
@property {String} [AUTH_EXPIRY] The [user/fromACL module]{@link module:/user/fromACL} can expiry user authorization if the AUTH_EXPIRY env is configured.
@property {String} [FAILED_ATTEMPTS='3'] The [user/fromACL module]{@link module:/user/fromACL} will expire user validation if failed login attempts exceed the FAILED_ATTEMPTS value.
@property {String} [PASSWORD_REGEXP='(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{10,}$'] The [user/register module]{@link module:/user/register} will apply PASSWORD_REGEXP value to check the complexity of provided user passwords.
@property {String} [STATEMENT_TIMEOUT] The [utils/dbs module]{@link module:/utils/dbs} will apply the STATEMENT_TIMEOUT to the query.client.
@property {String} [WORKSPACE_AGE] The [workspace/cache module]{@link module:/mod/workspace/cache} flashes the workspace cache after the WORKSPACE_AGE is reached.
@property {String} [CUSTOM_TEMPLATES] The [workspace/cache module]{@link module:/mod/workspace/cache} caches templates defined as a src in the CUSTOM_TEMPLATES env.
@property {String} [TRANSPORT] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_HOST] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_EMAIL] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_PASSWORD] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [TRANSPORT_PORT] The [utils/mailer module]{@link module:/utils/mailer} requires a TRANSPORT env.
@property {String} [USER_DOMAINS] The [user/register module]{@link module:/user/register} will limit the registration to user emails for domains provided in the comma seperated USER_DOMAINS env.
@property {String} [SRC_] SRC_* values will replace the key wildcard [*] in the stringified workspace.
@property {String} [KEY_CLOUDFRONT] A key [*.pem] file matching the KEY_CLOUDFRONT value is required for authentication requests in the [cloudfront]{@link module:/provider/cloudfront} provider module.
@property {String} [AWS_S3_CLIENT] A AWS_S3_CLIENT env is required to sign requests with the [s3]{@link module:/sign/s3} signer module.
@property {String} [CLOUDINARY_URL] A CLOUDINARY_URL env is required to sign requests with the [cloudinary]{@link module:/sign/cloudinary} signer module.
@property {String} [SAML_ENTITY_ID] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_LOGIN] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_SP_CRT] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_ACS] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_SSO] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_SLO] Required authentication via [SAML]{@link module:/user/saml}.
@property {String} [SAML_IDP_CRT] Required authentication via [SAML]{@link module:/user/saml}.
*/

const login = require('../mod/user/login')

const auth = require('../mod/user/auth')

const saml = process.env.SAML_ENTITY_ID && require('../mod/user/saml')

const register = require('../mod/user/register')

const logger = require('../mod/utils/logger')

const routes = {
  fetch: require('../mod/fetch'),
  query: require('../mod/query'),
  view: require('../mod/view'),
  provider: require('../mod/provider/_provider'),
  sign: require('../mod/sign/_sign'),
  user: require('../mod/user/_user'),
  workspace: require('../mod/workspace/_workspace'),
}

process.env.COOKIE_TTL ??= '36000'

process.env.TITLE ??= 'GEOLYTIX | XYZ'

process.env.DIR ??= ''

/**
@function api
@async

@description
The API method will redirect requests with a request url length 1 and DIR process.env.

eg. A request to localhost:3000 with a DIR = "/mapp" will be redirected to localhost:3000/mapp

The request object itself or the request object url will be logged with the `req` or `req_url` keys in process.env.LOGS.

Requests with the url matching the /saml/ path will be passed to the [saml module]{@link module:/user/saml}.

Requests with a logout parameter property will set the header cookie to null and return with a redirect to the application domain path [process.env.DIR].

Request parameter will be assigned once validated with the validateRequestParams method.

Requests with a login param or login property in the request body object will shortcircuit to the [user/login]{@link module:/user/login} module.

Requests with a register param or register property in the request body object will shortcircuit to the [user/register]{@link module:/user/register} module.

The [user/auth]{@link module:/user/auth} module is called to return a user object. Private instances must return a user object and will return an error if authentication fails.

Finally check whether the request should be passed to an API module or the default [/view]{@link module:/view} module.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
module.exports = async function api(req, res) {

  // redirect if dir is missing in url path.
  if (process.env.DIR && req.url.length === 1) {
    res.setHeader('location', `${process.env.DIR}`)
    return res.status(302).send()
  }

  logger(req, 'req')

  logger(req.url, 'req_url')

  // SAML request.
  if (req.url.match(/\/saml/)) {

    // saml will be undefined without a process.env.SAML_ENTITY_ID
    if (!saml) return;

    return saml(req, res)
  }

  if (req.params.logout) {

    // Remove cookie.
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

    // Set location to the domain path.
    res.setHeader('location', (process.env.DIR || '/') + (req.params.msg && `?msg=${req.params.msg}` || ''))

    return res.status(302).send()
  }

  req.params = validateRequestParams(req)

  if (req.params instanceof Error) {

    return res.status(400).send(req.params.message)
  }

  // Short circuit to user/login.
  if (req.params.login || req.body?.login) {
    return login(req, res)
  }

  // Short circuit to user/register
  if (req.params.register || req.body?.register) {
    return register(req, res)
  }

  // Validate signature of either request token, authorization header, or cookie.
  const user = await auth(req, res)

  // Remove token from params object.
  delete req.params.token

  // The authentication method returns an error.
  if (user && user instanceof Error) {

    if (req.headers.authorization) {

      // Request with failed authorization headers are not passed to login.
      return res.status(401).send(user.message)
    }

    // Remove cookie.
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)

    // Set msg parameter for the login view.
    req.params.msg = user.msg || user.message

    // Return login view with error message.
    return login(req, res)
  }

  // Set user as request parameter.
  req.params.user = user

  // User route
  if (req.url.match(/(?<=\/api\/user)/)) {

    // A msg will be returned if the user does not met the required priviliges.
    return routes.user(req, res)
  }

  // The login view will be returned for all PRIVATE requests without a valid user.
  if (!user && process.env.PRIVATE) {

    if (process.env.SAML_LOGIN) {
      res.setHeader('location', `${process.env.DIR}/saml/login`)
      return res.status(302).send()
    }

    return login(req, res)
  }

  // Provider route
  if (req.url.match(/(?<=\/api\/provider)/)) {
    return routes.provider(req, res)
  }

  // Signing route
  if (req.url.match(/(?<=\/api\/sign)/)) {
    return routes.sign(req, res)
  }

  // Location route
  if (req.url.match(/(?<=\/api\/location)/)) {

    // Set template and route to query mod.
    req.params.template = `location_${req.params.method}`

    return routes.query(req, res)
  }

  // Query route
  if (req.url.match(/(?<=\/api\/query)/)) {
    return routes.query(req, res)
  }

  // Fetch route
  if (req.url.match(/(?<=\/api\/fetch)/)) {
    return routes.fetch(req, res)
  }

  // Workspace route
  if (req.url.match(/(?<=\/api\/workspace)/)) {
    return routes.workspace(req, res)
  }

  // Return the View API on the root.
  routes.view(req, res)
}

/**
@function validateRequestParams

@description
The method assigns a params object from the request params and query objects.

The method will return an error if some params key contains non whitelisted character or if the restricted user param is detected.

The template param will be set from _template if not explicit. This is required for the vercel router logic which does not allow to use URL path parameter to have the same key as request parameter.

The params object will have a language property which is set to `en` if not explicit.

The params object properties will be iterated through to parse Object values [eg null, boolean, array], and remove undefined parameter properties.

@param {req} req HTTP request.
@property {Object} req.params The request params object.
@property {Object} req.query The request query object.

@returns {Object} Returns a validated params object.
*/
function validateRequestParams(req) {

  // Merge request params and query params.
  const params = Object.assign(req.params || {}, req.query || {})

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(params).some(key => !/^[A-Za-z0-9_-]*$/.exec(key))) {

    return new Error('URL parameter key validation failed.')
  }

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(params).some(key => key === 'user')) {

    return new Error('user is a restricted request parameter.')
  }

  // Language param will default to english [en] is not explicitly set.
  params.language ??= 'en'

  // Assign from _template if provided as path param.
  params.template ??= params._template

  for (const key in params) {

    // Delete param keys with undefined values.
    if (params[key] === undefined) {
      delete params[key]
      continue;
    }

    // Delete param keys with empty string value.
    if (params[key] === '') {
      delete params[key]
      continue;
    }

    // Parse lowerCase object value.
    switch (params[key].toLowerCase()) {

      case ('null'):
        params[key] = null
        continue;

      case ('false'):
        params[key] = false
        continue;

      case ('true'):
        params[key] = true
        continue;
    }

    // Check whether the params value begins and ends with square braces.
    if (params[key].match(/^\[.*\]$/)) {

      // Match the string between square brackets and split into an array with undefined array values filtered out.
      params[key] = match(/^\[(.*)\]$/)[1].split(',').filter(Boolean)
    }
  }

  return params
}
