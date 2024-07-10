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

The loginView method will be returned with a message from a failed user validation or if no login post request body is provided.

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

  return loginView(req, res)
}


/**
@function loginView

@description
Any existing user cookie for the XYZ instance will be removed [set to null].

A redirect cookie will be set to the response header for a redirect to the location after sucessful login.

The default `login_view` will be set as template request parameter before the XYZ View API method will be returned.

@param {Object} req HTTP request.
@param {Object} req.params HTTP request parameter.
@param {Object} res HTTP response.
*/

function loginView(req, res) {

  // Clear user token cookie.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  // The redirect for a successful login.
  const redirect = req.url && decodeURIComponent(req.url).replace(/login\=true/, '')

  // Set cookie with redirect value.
  res.setHeader('Set-Cookie', `${process.env.TITLE}_redirect=${redirect};HttpOnly;Max-Age=60000;Path=${process.env.DIR || '/'}`)

  req.params.template = 'login_view'

  view(req, res)
}
