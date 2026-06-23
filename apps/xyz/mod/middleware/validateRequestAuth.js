/**
## /middleware/validateRequestAuth

@requires [user/auth]{@link module:/user/auth}

@module /middleware/validateRequestAuth
*/

import auth from '../user/auth.js';

/**
@function validateRequestAuth
@async

@description
The async validateRequestAuth will wait for the [user/auth]{@link module:/user/auth} module to return a user object.

The user object will be assigned as to the req.params.

PRIVATE processes require user auth for all requests. The redirect logic will set the location header to the login page which is either defined by xyzEnv.AUTH_PATH or defaults to /api/user/login.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params The request params which will be parsed by the validateRequestParams method.
@property {Object} req.headers The request headers.
@property {Object} [headers.authorization] The request carries an authorization header.
@property {string} req.url The request url.
*/
export default async function validateRequestAuth(req, res, next) {
  // Assign _params object from validateRequestParams module to req.params.
  Object.assign(req.params, req._params);

  // Validate signature of either request token, authorization header, or cookie.
  req.params.user = await auth(req, res);

  // The auth module has sent a response.
  if (res.finished) return;

  // Remove token from params object.
  delete req.params.token;

  // The authentication method returns an error.
  if (req.params.user instanceof Error) {
    // Remove cookie.
    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=null; Max-Age=0; ${xyzEnv.COOKIE_PROPS}`,
    );

    res.status(401).send(req.params.user.message);
    return;
  }

  // PRIVATE instances require user auth for all requests.
  if (!req.params.user && xyzEnv.PRIVATE) {
    if (loginRedirect(req, res)) {
      // The request has a redirect cookie.
      console.log(req.url);
      //return;
    }

    if (xyzEnv.AUTH_PATH) {
      res.setHeader('location', `${xyzEnv.DIR}${xyzEnv.AUTH_PATH}/login`);
    } else {
      res.setHeader('location', `${xyzEnv.DIR}/api/user/login`);
    }

    res.status(302).send();
    return;
  }

  next();
}

/**
@function loginRedirect

@description
The method will shortcircuit with an existing redirect `_redirect` cookie.

Otherwise the request url will decoded and assigned to a redirect cookie with a short TTL of 60 seconds.

Any existing user cookie will be removed to prevent unauthorized access with an existing cookie.

The redirect cookie is used to redirect the user back to the original requested url after a successful login.

@param {req} req HTTP request.
@param {res} res HTTP response.
*/
function loginRedirect(req, res) {
  if (req.url === `${xyzEnv.DIR}/`) {
    return;
  }

  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  if (redirect) {
    return true;
  }

  const redirectUrl = req.url.startsWith('/')
    ? encodeURIComponent(req.url)
    : xyzEnv.DIR || '/';

  const user_cookie = `${xyzEnv.TITLE}=null; Max-Age=0; ${xyzEnv.COOKIE_PROPS}`;

  const redirect_cookie = `${xyzEnv.TITLE}_redirect=${redirectUrl}; Max-Age=60; ${xyzEnv.COOKIE_PROPS}`;

  // Set cookie with properly encoded redirect value.
  res.setHeader('Set-Cookie', [user_cookie, redirect_cookie]);
}
