const getToken = require('./token')

const login = require('./login')

const messages = require('./messages')

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  if (!req.body) {
  
    const cookie = req.cookies && req.cookies[process.env.TITLE]

    if (cookie) {

      return jwt.verify(
        cookie,
        process.env.SECRET,
        async (err, user) => {

          if (err) return err

          user.iat = new Date(user.iat * 1000)
          user.exp = new Date(user.exp * 1000)

          res.send(user)

        })

    }

    return login(req, res, messages.no_cookie_found[req.params.language || 'en'] || `No cookie relating to this application found on request`)

  }

  const token = await getToken(req)

  if (token instanceof Error) return login(req, res, token.message)
 
  const cookie = `${process.env.TITLE}=${token.signed || token};HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

  res.setHeader('Set-Cookie', cookie)

  res.setHeader('location', `${req.body.redirect}`)

  res.status(302).send()
}