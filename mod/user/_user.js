const view = require('../view')

const methods = {
  admin: {
    handler: (req,res) => {
      req.params.template = 'user_admin_view'
      req.params.language = req.params.user.language
      req.params.user = req.params.user.email
      view(req, res)
    },
    admin: true
  },
  register: {
    handler: require('./register')
  },
  verify: {
    handler: require('./verify')
  },
  add: {
    handler: require('./add'),
    admin: true
  },
  delete: {
    handler: require('./delete'),
    admin: true
  },
  update: {
    handler: require('./update'),
    admin: true
  },
  list: {
    handler: require('./list'),
    admin: true
  },
  log: {
    handler: require('./log'),
    admin: true
  },
  key: {
    handler: require('./key'),
    login: true
  },
  token: {
    handler: require('./token'),
    login: true
  },
  cookie: {
    handler: require('./cookie')
  },
  login: {
    handler: require('./login')
  }
}

module.exports = async (req, res) => {

  const method = methods[req.params.method]

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.`)
  }

  if (!req.params.user && (method.login || method.admin)) {

    req.params.msg = 'login_required'
    return methods.login.handler(req,res)
  }

  if (req.params.user && (!req.params.user.admin && method.admin)) {

    req.params.msg = 'admin_required'
    return methods.login.handler(req,res)
  }

  method.handler(req, res)
}