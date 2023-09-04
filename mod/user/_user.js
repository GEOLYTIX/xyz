const methods = {
  admin: {
    handler: require('./admin'),
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

module.exports = (req, res) => {

  const method = methods[req.params.method]

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/user/">User API</a>`)
  }

  if (!req.params.user && (method.login || method.admin)) return 'login_required'

  if (req.params.user && (!req.params.user.admin && method.admin)) return 'admin_required'

  method.handler(req, res)
  
}