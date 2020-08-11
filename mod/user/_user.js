const auth = require('./auth')

const _method = {
  register: {
    handler: require('./register')
  },
  verify: {
    handler: require('./verify')
  },
  delete: {
    handler: require('./delete'),
    access: 'admin_user'
  },
  update: {
    handler: require('./update'),
    access: 'admin_user'
  },
  approve: {
    handler: require('./approve'),
    access: 'admin_user'
  },
  list: {
    handler: require('./list'),
    access: 'admin_user'
  },
  log: {
    handler: require('./log'),
    access: 'admin_user'
  },
  pgtable: {
    handler: require('./pgtable'),
    access: 'admin_user'
  },
  key: {
    handler: require('./key'),
    access: 'key'
  },
  token: {
    handler: (req, res) => res.send(req.params.token.signed),
    access: 'login'
  },
  cookie: {
    handler: require('./cookie')
  },
  logout: {
    handler: (req, res) => {
      res.setHeader('Set-Cookie', `XYZ ${process.env.TITLE || 'token'}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
      return res.send('Logged out.')
    }
  }
}

module.exports = async (req, res) => {

  const method = _method[req.params.method]

  if (!method) {
    return res.send(`Failed to evaluate 'method' param.<br><br>
    <a href="https://geolytix.github.io/xyz/docs/develop/api/user/">User API</a>`)
  }

  method.access && await auth(req, res, method.access)

  if (res.finished) return

  method.handler(req, res)
  
}