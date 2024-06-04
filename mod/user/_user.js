/**
## /mod/user/_user

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

@module /mod/user/_user
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