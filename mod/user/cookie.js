const login = require('./login')

const messages = require('./messages')

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  const cookie = req.cookies && req.cookies[process.env.TITLE]

  if (req.params.destroy) {
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
    return res.send('This too shall pass')
  }

  if (!cookie) return login(req, res, messages.no_cookie_found[req.params.language || 'en'] || `No cookie relating to this application found on request`)

  jwt.verify(
    cookie,
    process.env.SECRET,
    async (err, user) => {

      if (err) return err

      delete user.iat
      delete user.exp

      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: 60
      })

      const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=60;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

      res.setHeader('Set-Cookie', cookie)

      res.send(user)

    })

}