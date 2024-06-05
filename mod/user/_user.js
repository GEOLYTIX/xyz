/**
## /user/_user

The _user module exports the user method to route User API requests.

- admin
- register
- verify
- add
- delete
- update
- list
- log
- key
- token
- cookie
- login

@module /user
*/

const reqHost = require('../utils/reqHost')

const methods = {
  admin: require('./admin'),
  register: require('./register'),
  verify: require('./verify'),
  add: require('./add'),
  delete: require('./delete'),
  update: require('./update'),
  list: require('./list'),
  log: require('./log'),
  key: require('./key'),
  token: require('./token'),
  cookie: require('./cookie'),
  login: require('./login')
}

/**
### user(req, res)

The Mapp API uses the user method to lookup and route User API requests.

The route method assigns the host param from /utils/reqHost before the request and response arguments are passed a User API method identified by the method param.

The method request parameter must be an own member of the methods object, eg. `admin`, `register`, `verify`, `add`, `delete`, `update`, `list`, `log`, `key`, `token`, `cookie`, or `login`.

@function user
@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params Request parameter.
@param {string} req.params.method Method request parameter.
*/

module.exports = async function user(req, res) {

  if (!Object.hasOwn(methods, req.params.method)) {

    return res.send(`Failed to evaluate 'method' param.`)
  }

  req.params.host = reqHost(req)

  const method = await methods[req.params.method](req, res)

  if (method instanceof Error) {

    req.params.msg = method.message
    methods.login(req, res)
  }
}