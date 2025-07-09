/**
## XYZ API

The XYZ API module exports the api function which serves as the entry point for all XYZ API requests.

A node.js express app will require the api module and reference the exported api method for all request routes.

```js
const app = express()
const api = require('./api/api')
app.get(`/`, api)
```

@requires /utils/processEnv
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
@typedef {Object} res
The res object represents the HTTP response that an [Express] app sends when it gets an HTTP request.
*/

/**
@global
@typedef {Object} req
The req object represents the HTTP request and has properties for the request query string, parameters, body, HTTP headers, and so on.
@property {Object} params HTTP request parameter.
@property {Object} [body] HTTP POST request body.
@property {Object} header HTTP request header.
*/

import '../mod/utils/processEnv.js';
import provider from '../mod/provider/_provider.js';
//Route imports
import query from '../mod/query.js';
import sign from '../mod/sign/_sign.js';
import user from '../mod/user/_user.js';
import auth from '../mod/user/auth.js';
import login from '../mod/user/login.js';
import register from '../mod/user/register.js';
import saml from '../mod/user/saml.js';
import logger from '../mod/utils/logger.js';
import view from '../mod/view.js';
import workspace from '../mod/workspace/_workspace.js';

// Group all routes
const routes = {
  provider,
  query,
  sign,
  user,
  view,
  workspace,
};

/**
@function api

@description
The API method will redirect requests with a request url length 1 and xyzEnv.DIR.

eg. A request to localhost:3000 with a DIR = "/mapp" will be redirected to localhost:3000/mapp

The request object itself or the request object url will be logged with the `req` or `req_url` keys in xyzEnv.LOGS.

Requests with the url matching the /saml/ path will be passed to the [saml module]{@link module:/user/saml}.

Request parameter will be assigned once validated with the validateRequestParams method.

Requests with a logout parameter property will set the header cookie to null and return with a redirect to the application domain path [xyzEnv.DIR].

Requests with a login param or login property in the request body object will shortcircuit to the [user/login]{@link module:/user/login} module.

Requests with a register param or register property in the request body object will shortcircuit to the [user/register]{@link module:/user/register} module.

All other requests will passed to the async validateRequestAuth method.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params The request params which will be parsed by the validateRequestParams method.
@property {Boolean} params.logout The request should destroy the user cookie and shortciircuit.
@property {Boolean} params.login The request should redirect to user/login.
@property {Boolean} params.register The request should redirect to user/register.
*/
export default function api(req, res) {
  // redirect if dir is missing in url path.
  if (xyzEnv.DIR && req.url.length === 1) {
    res.setHeader('location', `${xyzEnv.DIR}`);
    return res.status(302).send();
  }

  logger(req, 'req');

  logger(req.url, 'req_url');

  // SAML request.
  if (req.url.match(/\/saml/)) {
    return saml(req, res);
  }

  req.params = validateRequestParams(req);

  if (req.params instanceof Error) {
    return res
      .status(400)
      .setHeader('Content-Type', 'text/plain')
      .send(req.params.message);
  }

  if (req.params.logout) {
    if (xyzEnv.SAML_SLO) {
      res.setHeader('location', `${xyzEnv.DIR}/saml/logout`);
      return res.status(302).send();
    }
    // Remove cookie.
    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
    );

    const msg = req.params.msg ? `?msg=${req.params.msg}` : '';

    // Set location to the domain path.
    res.setHeader('location', `${xyzEnv.DIR || '/'}${msg}`);

    return res.status(302).send();
  }

  // Short circuit to user/login.
  if (req.params.login || req.body?.login) {
    return login(req, res);
  }

  // Short circuit to user/register
  if (req.params.register || req.body?.register) {
    return register(req, res);
  }

  validateRequestAuth(req, res);
}

/**
@function validateRequestAuth
@async

@description
The async validateRequestAuth will wait for the [user/auth]{@link module:/user/auth} module to return a user object.

Requests without authorization headers will be redirected to the login if the user authentication errs.

The user object will be assigned as to the req.params.

PRIVATE processes require user auth for all requests and will shortcircuit to the user/login if the user authentication failed to resolve a user object.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params The request params which will be parsed by the validateRequestParams method.
@property {Object} req.headers The request headers.
@property {Object} [headers.authorization] The request carries an authorization header.
@property {string} req.url The request url.
*/
async function validateRequestAuth(req, res) {
  // Validate signature of either request token, authorization header, or cookie.
  const user = await auth(req, res);

  // Remove token from params object.
  delete req.params.token;

  // The authentication method returns an error.
  if (user && user instanceof Error) {
    if (req.headers.authorization) {
      // Request with failed authorization headers are not passed to login.
      return res.status(401).send(user.message);
    }

    // Remove cookie.
    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'};SameSite=Strict${(!req.headers.host.includes('localhost') && ';Secure') || ''}`,
    );

    // Set msg parameter for the login view.
    // The msg provides information in regards to failed logins.
    req.params.msg = user.msg || user.message;

    // Return login view with error message.
    return login(req, res);
  }

  // Set user as request parameter.
  req.params.user = user;

  // User route
  if (req.url.match(/(?<=\/api\/user)/)) {
    //Requests to the User API maybe for login or registration and must be routed before the check for PRIVATE processes.
    return routes.user(req, res);
  }

  // PRIVATE instances require user auth for all requests.
  if (!req.params.user && xyzEnv.PRIVATE) {
    // Redirect to the SAML login.
    if (xyzEnv.SAML_LOGIN) {
      res.setHeader('location', `${xyzEnv.DIR}/saml/login`);
      return res.status(302).send();
    }

    return login(req, res);
  }

  requestRouter(req, res);
}

/**
@function requestRouter

@description
The requestRouter switch tests the request URL for an API case.

By default requests will be passed to the [View API]{@link module:/view} module.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {string} req.url The request url.
*/
function requestRouter(req, res) {
  switch (true) {
    // Provider API
    case /(?<=\/api\/provider)/.test(req.url):
      routes.provider(req, res);
      break;

    // Signer API
    case /(?<=\/api\/sign)/.test(req.url):
      routes.sign(req, res);
      break;

    // Location API [deprecated]
    case /(?<=\/api\/location)/.test(req.url):
      // Route to Query API with location template
      req.params.template = `location_${req.params.method}`;
      routes.query(req, res);
      break;

    // Query API
    case /(?<=\/api\/query)/.test(req.url):
      routes.query(req, res);
      break;

    case /(?<=\/api\/workspace)/.test(req.url):
      routes.workspace(req, res);
      break;

    // View API is the default route.
    default:
      routes.view(req, res);
  }
}

/**
@function validateRequestParams

@description
The method assigns a params object from the request params and query objects.

The restricted params.user will be deleted. The params.user can only be assigned from a user object returned from the [user/auth]{@link module:/user/auth} module.

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
  const params = Object.assign(req.params || {}, req.query || {});

  // User is a restricted parameter.
  delete params.user;

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(params).some((key) => !/^[A-Za-z0-9_-]*$/.exec(key))) {
    return new Error('URL parameter key validation failed.');
  }

  // URL parameter keys must match white listed letters and numbers only.
  if (Object.keys(params).some((key) => key === 'user')) {
    return new Error('user is a restricted request parameter.');
  }

  // Language param will default to english [en] is not explicitly set.
  params.language ??= 'en';

  // Assign from _template if provided as path param.
  params.template ??= params._template;

  for (const key in params) {
    // Delete param keys with undefined values.
    if (params[key] === undefined) {
      delete params[key];
      continue;
    }

    // Delete param keys with empty string value.
    if (params[key] === '') {
      delete params[key];
      continue;
    }

    // Parse lowerCase object value.
    switch (params[key].toLowerCase()) {
      case 'null':
        params[key] = null;
        continue;

      case 'false':
        params[key] = false;
        continue;

      case 'true':
        params[key] = true;
        continue;
    }

    // Check whether the params value begins and ends with square braces.
    if (params[key].match(/^\[.*\]$/)) {
      // Match the string between square brackets and split into an array with undefined array values filtered out.
      params[key] = params[key]
        .match(/^\[(.*)\]$/)[1]
        .split(',')
        .filter(Boolean);
    }
  }

  return params;
}
