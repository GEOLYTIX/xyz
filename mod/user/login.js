/**
## /user/login

Exports the login method for the /api/user/login route.

@requires module:/user/fromACL
@requires module:/view
@requires jsonwebtoken
@requires mapp_env

@module /user/login
*/
const env = require('../utils/processEnv.js')

const fromACL = require('./fromACL')

const view = require('../view')

const jwt = require('jsonwebtoken')

/**
@function login

@description
The method will shortcircuit if the fromACL module exports null with a missing ACL configuration.

Requests which require authentication will return the login method if the authentication fails.

The loginBody method will be called if the request has a POST body.

The loginView method will be returned with a message from a failed user validation or if no login post request body is provided.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {string} [req.params.msg] A message string in regards to a failed loging.
@property {Object} [req.params.user] Mapp User object.
@property {Object} [req.body] HTTP POST request body.
*/
module.exports = function login(req, res) {

  if (fromACL === null) {
    res.status(405).send('The ACL has not been configured to support login.')
    return;
  }

  // The request has body with data from the login view submit.
  if (req.body) {

    loginBody(req, res)
    return;
  }

  if (!req.params.msg && req.params.user) {

    res.setHeader('location', `${env.DIR || '/'}`)
    res.status(302).send()
    return;
  }

  return loginView(req, res)
}

/**
@function loginBody
@async

@description
A user object will be requested from the ACL.

The method checks for a redirect location on a `_redirect` cookie.

The login view will be returned if the fromACL() errs.

A user cookie will signed and set as response header.

The response will be redirected to the location from the redirect cookie. The redirect cookie will be removed.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} req.body HTTP POST request body.
*/
async function loginBody(req, res) {

  const user = await fromACL(req)

  const redirect = req.cookies && req.cookies[`${env.TITLE}_redirect`]

  // The redirect indicates that a previous login has failed.
  if (user instanceof Error && redirect) {

    req.params.msg = user.message
    return loginView(req, res)
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
    env.SECRET,
    {
      expiresIn: parseInt(env.COOKIE_TTL)
    })

  const user_cookie = `${env.TITLE}=${token};HttpOnly;Max-Age=${env.COOKIE_TTL};Path=${env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

  const redirect_null_cookie = `${env.TITLE}_redirect=null;HttpOnly;Max-Age=0;Path=${env.DIR || '/'}`

  res.setHeader('Set-Cookie', [user_cookie, redirect_null_cookie])
  res.setHeader('location', `${redirect || env.DIR}`)
  res.status(302).send()
}

/**
@function loginView

@description
Any existing user cookie for the XYZ instance will be removed [set to null].

A redirect cookie will be set to the response header for a redirect to the location after sucessful login.

The default `login_view` will be set as template request parameter before the XYZ View API method will be returned.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
*/
function loginView(req, res) {

  // Clear user token cookie.
  res.setHeader('Set-Cookie', `${env.TITLE}=null;HttpOnly;Max-Age=0;Path=${env.DIR || '/'}`)

  // The redirect for a successful login.
  req.params.redirect = req.url && decodeURIComponent(req.url).replace(/login=true/, '')

  // Set cookie with redirect value.
  res.setHeader('Set-Cookie', `${env.TITLE}_redirect=${req.params.redirect};HttpOnly;Max-Age=60000;Path=${env.DIR || '/'}`)

  req.params.template = 'login_view'

  view(req, res)
}
