const auth = require('./auth')

const messages = require('./messages')

const jwt = require('jsonwebtoken')

const _method = {
  register: {
    handler: require('./register')
  },
  verify: {
    handler: require('./verify')
  },
  delete: {
    handler: require('./delete'),
    access: 'admin'
  },
  update: {
    handler: require('./update'),
    access: 'admin'
  },
  approve: {
    handler: require('./approve'),
    access: 'admin'
  },
  list: {
    handler: require('./list'),
    access: 'admin'
  },
  log: {
    handler: require('./log'),
    access: 'admin'
  },
  pgtable: {
    handler: require('./pgtable'),
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

      let token = jwt.decode(req.cookies && req.cookies[`XYZ ${process.env.TITLE}`])

      token.signed = jwt.sign({
        msg: messages.logout[token.language || 'en'] || `Logged out.`
      },
      process.env.SECRET, {
        expiresIn: '3s'
      })

      res.setHeader('Set-Cookie', `XYZ ${process.env.TITLE}=${token.signed};HttpOnly;Max-Age=3;Path=${process.env.DIR || '/'}`)
      
      res.setHeader('location', `${process.env.DIR || ''}?language=${token.language || 'en'}`)

      res.status(302).send()
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