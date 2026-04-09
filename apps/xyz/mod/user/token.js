/**
## /user/token 🎟

Exports the userToken method for the /api/user/token route. A token can be provided as a parameter to provide authentication with the user roles that request the token from the api.

A new token may not be requested from a user authenticated by a token.

Token authentication will never provide admin access.

@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/token
*/

import jwt from 'jsonwebtoken';

/**
@function userToken

@description
The `/api/user/token` endpoint requests a jsonwebtoken for the user object.

The encoded user token expires in 8hours and does not carry admin rights.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {Object} req.params Request parameter.
@param {Object} params.user Requesting user.
@param {string} [params.expiresin='8hr'] Time string for token expiration.
*/

export default async function userToken(req, res) {
  if (!req.params.user) {
    return new Error('login_required');
  }

  const user = req.params.user;

  if (user.from_token) {
    return new Error('Token may not be generated from token authentication.');
  }

  delete user.admin;
  delete user.exp;
  delete user.iat;

  req.params.expiresin ??= '8hr';

  const token = jwt.sign(req.params.user, xyzEnv.SECRET, {
    expiresIn: req.params.expiresin,
    algorithm: xyzEnv.SECRET_ALGORITHM,
  });

  res.send(token);
}
