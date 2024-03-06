/**
@module /user/login
*/

const jwt = require('jsonwebtoken')

const fromACL = require('./fromACL')

const view = require('../view')

module.exports = async (req, res) => {

  req.params.host = `${req.headers.origin 
    || req.headers.host && 'https://' + (process.env.ALIAS || req.headers.host)}${process.env.DIR}`
    || req.headers.referer && new URL(req.headers.referer).origin 

  if (req.body) {

    const user = await fromACL(req)

    const redirect = req.cookies && req.cookies[`${process.env.TITLE}_redirect`]

    if (user instanceof Error && redirect) {

      req.params.msg = user.message
      
      loginView(req, res)
      return 
    }

    if (user instanceof Error) return res.status(401).send(user.message)

    // Create token with 8 hour expiry.
    const token = jwt.sign(
      {
        email: user.email,
        admin: user.admin,
        language: user.language,
        roles: user.roles,
        session: user.session
      },
      process.env.SECRET,
      {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

    const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=${process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

    res.setHeader('Set-Cookie', cookie)

    res.setHeader('location', `${redirect && redirect.replace(/([?&]{1})msg={1}[^&]+(&|$)/,'') || process.env.DIR}`)

    return res.status(302).send()
  }

  if (!req.params.msg && req.params.user) {

    res.setHeader('location', `${process.env.DIR}`)
    res.status(302).send()
    return;
  }

  loginView(req, res)
}

async function loginView(req, res) {

  // Clear user token cookie.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  // The redirect for a successful login.
  const redirect = req.url && decodeURIComponent(req.url).replace(/login\=true/, '')

  // Set cookie with redirect value.
  res.setHeader('Set-Cookie', `${process.env.TITLE}_redirect=${redirect};HttpOnly;Max-Age=60000;Path=${process.env.DIR || '/'}`)

  req.params.template = 'login_view'

  view(req, res)
}
