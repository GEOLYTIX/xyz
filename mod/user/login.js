/**
## /user/login

Exports the login method for the /api/user/login route.

@requires module:/user/fromACL
@requires module:/view
@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/login
*/

import jsonwebtoken from 'jsonwebtoken';

import view from '../view.js';
import fromACL from './fromACL.js';

const { sign } = jsonwebtoken;

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
export default function login(req, res) {
  if (fromACL === null) {
    res.status(405).send('The ACL has not been configured to support login.');
    return;
  }

  // The request has body with data from the login view submit.
  if (req.body) {
    loginBody(req, res);
    return;
  }

  if (!req.params.msg && req.params.user) {
    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    res.status(302).send();
    return;
  }

  return loginView(req, res);
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
  const user = await fromACL(req);

  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  // Decode the redirect URL since it's now encoded when stored
  const decodedRedirect = redirect ? decodeURIComponent(redirect) : null;

  if (user instanceof Error) {
    // Return to loginView with a redirect from the loginView form.
    if (decodedRedirect) {
      req.params.msg = user.message;
      return loginView(req, res);
    }

    return res
      .status(401)
      .setHeader('Content-Type', 'text/plain')
      .send(user.message);
  }

  const token = sign(
    {
      admin: user.admin,
      email: user.email,
      language: user.language,
      roles: user.roles,
      session: user.session,
    },
    xyzEnv.SECRET,
    {
      expiresIn: xyzEnv.COOKIE_TTL,
      algorithm: xyzEnv.SECRET_ALGORITHM,
    },
  );

  const user_cookie = `${xyzEnv.TITLE}=${token};HttpOnly;Max-Age=${xyzEnv.COOKIE_TTL};Path=${xyzEnv.DIR || '/'};SameSite=Strict${(!req.headers.host.includes('localhost') && ';Secure') || ''}`;

  const redirect_null_cookie = `${xyzEnv.TITLE}_redirect=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`;

  res.setHeader('Set-Cookie', [user_cookie, redirect_null_cookie]);
  res.setHeader('location', `${decodedRedirect || xyzEnv.DIR}`);
  res.status(302).send();
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
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}=null;HttpOnly;Max-Age=0;Path=${xyzEnv.DIR || '/'}`,
  );

  // The redirect for a successful login.
  let redirectUrl =
    req.url && decodeURIComponent(req.url).replace(/login=true/, '');

  // Validate and sanitize the redirect URL to prevent cookie injection
  if (redirectUrl) {
    // Remove any characters that could be used for cookie injection
    redirectUrl = redirectUrl.replace(/[;\r\n]/g, '');

    // Ensure it's a relative URL (it starts with '/')
    if (!redirectUrl.startsWith('/')) {
      redirectUrl = xyzEnv.DIR || '/';
    }
  } else {
    redirectUrl = xyzEnv.DIR || '/';
  }

  // Encode the URL for safe storage in the cookie
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);

  // Set cookie with properly encoded redirect value.
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}_redirect=${encodedRedirectUrl};HttpOnly;Max-Age=60000;Path=${xyzEnv.DIR || '/'}`,
  );

  req.params.template = 'login_view';

  view(req, res);
}
