/**
## /user/token 🎟

Exports the userToken method for the /api/user/token route.

@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/key
*/

const jwt = require('jsonwebtoken');

/**
@function userToken

@description
The `/api/user/token` endpoint requests a jsonwebtoken for the user object.

The encoded user token expires in 8hours and does not carry admin rights.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.params.user 
Requesting user.
*/

module.exports = async function userToken(req, res) {
  if (!req.params.user) {
    return new Error('login_required');
  }

  const user = req.params.user;

  if (user.from_token) {
    return res.send('Token may not be generated from token authentication.');
  }

  delete user.admin;
  delete user.exp;
  delete user.iat;

  const token = jwt.sign(req.params.user, xyzEnv.SECRET, {
    expiresIn: '8hr',
  });

  res.send(token);
};
