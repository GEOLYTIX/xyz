/**
## /user/login

Exports the login method for the /api/user/login route.

@requires module:/user/fromACL
@requires module:/view
@requires jsonwebtoken

@module /user/login
*/

const fromACL = require('./fromACL')

const view = require('../view')

const jwt = require('jsonwebtoken')

/**
@function login
@async

@description
Request which require authentication will return the login method if the authentication fails.

The login method will request the fromACL() method for a user with login details in the Post Request body.

A user cookie will be assigned for the user returned from the fromACL() method and the response will be redirected to the intended target location.

Any existing user cookie will be removed from the response header if no post request body is provided or if the fromACL() method failed to get a validated user object.

The default `login_view` is set a template request parameter before the XYZ View API method is returned.

@param {Object} req HTTP request.
@param {Object} req.params HTTP request parameter.
@param {Object} [req.params.user] Mapp User object.
@param {Object} req.body HTTP POST request body.
@param {Object} res HTTP response.
*/

module.exports = async function login(req, res) {

  if (req.body) {

    const user = await fromACL(req)

    const redirect = req.cookies && req.cookies[`${process.env.TITLE}_redirect`]

    if (user instanceof Error && redirect) {

      req.params.msg = user.message
      
      loginView(req, res)
      return 
    }

    if (user instanceof Error) {
      return res.status(401).send(user.message)
    }

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

    res.setHeader('location', `${process.env.DIR || '/'}`)
    res.status(302).send()
    return;
  }

  // Clear user token cookie.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  req.params.template = 'login_view'

  view(req, res)
}
