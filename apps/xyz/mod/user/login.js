/**
## /user/login

Exports the login method for the /api/user/login route.

@requires module:/user/fromACL
@requires module:/view
@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/login
*/

import view from '../view.js';
import fromACL from './fromACL.js';
import redirect from './redirect.js';

/**
@function login

@description
The method will shortcircuit if the fromACL module exports null with a missing ACL configuration.

Requests which require authentication will return the login method if the authentication fails.

The loginBody method will be called if the request has a POST body.

The view method will be called with login_view template with a message from a failed user validation or if no login post request body is provided.

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
    return loginBody(req, res);
  }

  if (!req.params.msg && req.params.user) {
    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    res.status(302).send();
    return;
  }

  req.params.template = 'login_view';
  view(req, res);
}

/**
@function loginBody
@async

@description
A user object will be requested from the ACL.

The method checks for a redirect location on a `_redirect` cookie.

The login view will be returned if the fromACL() errs.

The user will be passed with the request and response object to the user/direct module.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} req.params HTTP request parameter.
@property {Object} req.body HTTP POST request body.
*/
async function loginBody(req, res) {
  const user = await fromACL(req);

  if (user instanceof Error) {
    if (req.cookies?.[`${xyzEnv.TITLE}_redirect`]) {
      req.params.msg = user.message;
      req.params.template = 'login_view';
      view(req, res);
      return;
    }

    return res
      .status(401)
      .setHeader('Content-Type', 'text/plain')
      .send(user.message);
  }

  redirect(req, res, user);
}
