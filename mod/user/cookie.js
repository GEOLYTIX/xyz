const getToken = require('./token')

const login = require('./login')

const messages = require('./messages')

module.exports = async (req, res) => {

  if (!req.body) {

    if (req.cookies && req.cookies[`XYZ ${process.env.TITLE || 'token'}`]) {

      return res.send(`XYZ ${process.env.TITLE || 'token'}=<a href="${process.env.DIR || '/'}api/user/token">token</a>;HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)

    }

    return login(req, res, messages.no_cookie_found[req.params.language || 'en'] || `No cookie relating to this application found on request`)

  }

  const token = await getToken(req)

  if (token instanceof Error) return res.send(token.message)
  
  const cookie = `XYZ ${process.env.TITLE || 'token'}=${token.signed || token};HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

  res.setHeader('Set-Cookie', cookie)

  res.setHeader('location', `${req.body.redirect}`)

  res.status(302).send()
}