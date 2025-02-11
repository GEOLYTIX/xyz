/**
## /user/_user

The _user module exports the user method to route User API requests.

- add
- admin
- cookie
- delete
- key
- list
- log
- login
- register
- token
- update
- verify

@requires module:/utils/reqHost

@module /user
*/

const reqHost = require('../utils/reqHost');

const methods = {
  add: require('./add'),
  admin: require('./admin'),
  cookie: require('./cookie'),
  delete: require('./delete'),
  key: require('./key'),
  list: require('./list'),
  log: require('./log'),
  login: require('./login'),
  register: require('./register'),
  token: require('./token'),
  update: require('./update'),
  verify: require('./verify'),
};

/**
@function user
@async

@description
The Mapp API uses the user method to lookup and route User API requests.

The route method assigns the host param from /utils/reqHost before the request and response arguments are passed a User API method identified by the method param.

The method request parameter must be an own member of the methods object, eg. `admin`, `register`, `verify`, `add`, `delete`, `update`, `list`, `log`, `key`, `token`, `cookie`, or `login`.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} req.params.method Method request parameter.
*/

module.exports = async function user(req, res) {
  if (!Object.hasOwn(methods, req.params.method)) {
    return res.send(`Failed to evaluate 'method' param.`);
  }

  req.params.host = reqHost(req);

  const method = await methods[req.params.method](req, res);

  if (method instanceof Error) {
    req.params.msg = method.message;
    methods.login(req, res);
  }
};
