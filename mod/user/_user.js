const { readFileSync } = require('fs')

const { join } = require('path')

const messages = require('./messages')

const jwt = require('jsonwebtoken')

const methods = {
  admin: {
    handler: (req, res) => {

      const template = readFileSync(join(__dirname, '../../public/views/_user.html')).toString('utf8')

      const params = {
        dir: process.env.DIR
      }
    
      // Render the login template with params.
      const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')
    
      res.send(html)

    },
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
  pgtable: {
    handler: require('./pgtable'),
    admin: true
  },
  key: {
    handler: require('./key'),
    login: true
  },
  token: {
    handler: (req, res) => {

      const user = req.params.user

      delete user.admin
      delete user.exp
      delete user.iat

      const token = jwt.sign(
        req.params.user,
        process.env.SECRET, {
          expiresIn: '8hr'
        })

      res.send(token)

    },
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