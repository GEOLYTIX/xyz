const messages = require('./messages')

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
  delete: {
    handler: require('./delete'),
    admin: true
  },
  update: {
    handler: require('./update'),
    admin: true
  },
  approve: {
    handler: require('./approve'),
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
  }
}

module.exports = (req, res) => {

  const method = methods[req.params.method]

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/user/">User API</a>`)
  }

  if (!req.params.user && (method.login || method.admin)) return 'Route requires login'

  if (req.params.user && (!req.params.user.admin && method.admin)) return 'Route requires admin priviliges'

  method.handler(req, res)
  
}