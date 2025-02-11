/**
## XYZ API

The XYX API module exports the api function which serves as the entry point for all XYZ API requests.

A node.js express app will require the api module and reference the exported api method for all request routes.

```js
const app = express()
const api = require('./api/api')
app.get(`/`, api)
```

@requires /view
@requires /query
@requires /fetch
@requires /sign
@requires /user/auth

@module /api
*/

const logger = require('../mod/utils/logger');

const login = require('../mod/user/login');

const register = require('../mod/user/register');

const auth = require('../mod/user/auth');

const saml = process.env.SAML_ENTITY_ID && require('../mod/user/saml');

const routes = {
  provider: require('../mod/provider/_provider'),
  sign: require('../mod/sign/_sign'),
  query: require('../mod/query'),
  fetch: require('../mod/fetch'),
  user: require('../mod/user/_user'),
  view: require('../mod/view'),
  workspace: require('../mod/workspace/_workspace'),
};

process.env.COOKIE_TTL ??= 36000;

process.env.TITLE ??= 'GEOLYTIX | XYZ';

process.env.DIR ??= '';

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
@function api
@async

@description
The XYZ api method will validate request parameter.

The API module method requires the user/auth module to authenticate private API requests.

Requests are passed to individual API modules from the api() method.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/

module.exports = async function api(req, res) {
  // redirect if dir is missing in url path.
  if (process.env.DIR && req.url.length === 1) {
    res.setHeader('location', `${process.env.DIR}`);
    return res.status(302).send();
  }

  logger(req, 'req');

  logger(req.url, 'req_url');

  // Request will be short circuited to the saml module.
  if (req.url.match(/\/saml/)) {
    if (!saml) return;
    return saml(req, res);
  }

  // Merge request params and query params.
  req.params = Object.assign(req.params || {}, req.query || {});

  Object.keys(req.params).forEach((key) => {
    // Set null from string.
    if (req.params[key]?.toLowerCase() === 'null') {
      req.params[key] = null;
      return;
    }

    // Set boolean false from string.
    if (req.params[key]?.toLowerCase() === 'false') {
      req.params[key] = false;
      return;
    }

    // Set boolean true from string.
    if (req.params[key]?.toLowerCase() === 'true') {
      req.params[key] = true;
      return;
    }

    // Delete param keys with undefined values.
    if (req.params[key] === undefined) {
      delete req.params[key];
      return;
    }

    // Delete param keys with empty string value.
    if (req.params[key] === '') {
      delete req.params[key];
      return;
    }

    // Check whether param begins and ends with square braces.
    if (
      typeof req.params[key] === 'string' &&
      req.params[key].match(/^\[.*\]$/)
    ) {
      // Slice square brackets of string and split on comma.
      req.params[key] = req.params[key].slice(1, -1).split(',');
    }
  });

  // Url parameter keys must be white listed as letters and numbers only.
  if (Object.keys(req.params).some((key) => !key.match(/^[A-Za-z0-9_-]*$/))) {
    return res.status(403).send('URL parameter key validation failed.');
  }

  // Language param will default to english [en] is not explicitly set.
  req.params.language ??= 'en';

  // Assign from _template if provided as path param.
  req.params.template ??= req.params._template;

  // Short circuit login view or post request.
  if (req.params.login || (req.body && req.body.login)) return login(req, res);

  // Short circuit register view or post request.
  if (req.params.register || (req.body && req.body.register))
    return register(req, res);

  // Short circuit logout request
  if (req.params.logout) {
    // Remove cookie.
    res.setHeader(
      'Set-Cookie',
      `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`,
    );

    // Remove logout parameter.
    res.setHeader(
      'location',
      (process.env.DIR || '/') +
        ((req.params.msg && `?msg=${req.params.msg}`) || ''),
    );

    return res.status(302).send();
  }

  // Validate signature of either request token or cookie.
  const user = await auth(req, res);

  // Remove token from params object.
  delete req.params.token;

  // The authentication method returns an error.
  if (user && user instanceof Error) {
    if (req.headers.authorization) {
      return res.status(401).send(user.message);
    }

    // Remove cookie.
    res.setHeader(
      'Set-Cookie',
      `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'};SameSite=Strict${(!req.headers.host.includes('localhost') && ';Secure') || ''}`,
    );

    req.params.msg = user.msg || user.message;

    // Return login view with error message.
    return login(req, res);
  }

  // Set user as request parameter.
  req.params.user = user;

  // User route
  if (req.url.match(/(?<=\/api\/user)/)) {
    // A msg will be returned if the user does not met the required priviliges.
    return routes.user(req, res);
  }

  // The login view will be returned for all PRIVATE requests without a valid user.
  if (!user && process.env.PRIVATE) {
    if (process.env.SAML_LOGIN) {
      res.setHeader('location', `${process.env.DIR}/saml/login`);
      return res.status(302).send();
    }

    return login(req, res);
  }

  // Provider route
  if (req.url.match(/(?<=\/api\/provider)/)) {
    return routes.provider(req, res);
  }

  // Signing route
  if (req.url.match(/(?<=\/api\/sign)/)) {
    return routes.sign(req, res);
  }

  // Location route
  if (req.url.match(/(?<=\/api\/location)/)) {
    // Set template and route to query mod.
    req.params.template = `location_${req.params.method}`;
    return routes.query(req, res);
  }

  // Query route
  if (req.url.match(/(?<=\/api\/query)/)) {
    return routes.query(req, res);
  }

  // Fetch route
  if (req.url.match(/(?<=\/api\/fetch)/)) {
    return routes.fetch(req, res);
  }

  // Workspace route
  if (req.url.match(/(?<=\/api\/workspace)/)) {
    return routes.workspace(req, res);
  }

  // Return the View API on the root.
  routes.view(req, res);
};
