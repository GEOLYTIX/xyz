const login = require('./login')

const jwt = require('jsonwebtoken')

const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  const cookie = req.cookies && req.cookies[process.env.TITLE]

  if (req.params.destroy) {
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
    return res.send('This too shall pass')
  }

  if (!cookie && req.params.renew) return res.status(401).send('Failed to renew cookie')

  if (!cookie) {

    // Get login view template.
    const loginView = await templates('no_cookie_found', req.params.language)
    
    return login(req, res, loginView)
  }

  jwt.verify(
    cookie,
    process.env.SECRET,
    async (err, user) => {

      if (err) return err

      delete user.iat
      delete user.exp

      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

      const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=${process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

      res.setHeader('Set-Cookie', cookie)

      res.send(user)

    })

}