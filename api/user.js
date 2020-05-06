const auth = require('../mod/auth/handler')

const _method = {
  register: {
    handler: require('../mod/user/register')
  },
  verify: {
    handler: require('../mod/user/verify')
  },
  delete: {
    handler: require('../mod/user/delete'),
    access: 'admin_user'
  },
  update: {
    handler: require('../mod/user/update'),
    access: 'admin_user'
  },
  approve: {
    handler: require('../mod/user/approve'),
    access: 'admin_user'
  },
  list: {
    handler: require('../mod/user/list'),
    access: 'admin_user'
  },
  log: {
    handler: require('../mod/user/log'),
    access: 'admin_user'
  },
  pgtable: {
    handler: require('../mod/user/pgtable'),
    access: 'admin_user'
  },
  key: {
    handler: require('../mod/user/key'),
    access: 'key'
  },
  token: {
    handler: (req, res) => res.send(req.params.token.signed),
    access: 'login'
  },
  cookie: {
    handler: require('../mod/auth/cookie')
  },
  logout: {
    handler: (req, res) => {
      res.setHeader('Set-Cookie', `XYZ ${process.env.COOKIE || process.env.TITLE || 'token'}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
      return res.send('Logged out.')
    }
  }
}

module.exports = async (req, res) => {

  req.params = Object.assign(req.params || {}, req.query || {})

  const method = _method[req.params.method]

  if (!method) return res.send('Help text.')

  method.access && await auth(req, res, method.access)

  if (res.finished) return

  method.handler(req, res)
}