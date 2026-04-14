/**
## /user/key 🔑

Exports the apiKey method for the /api/user/key route.

@requires module:/user/acl
@requires jsonwebtoken
@requires module:/utils/processEnv

@module /user/key
*/

import jwt from 'jsonwebtoken';
import acl from './acl.js';

/**
@function apiKey

@description
The `/api/user/key` endpoint requests a new API key for the requesting user.

The requesting user must have an ACL record with the `api` field not being null.

The newly generated API key does not expire but will overwrite any existing API key for the user in the ACL record.

An API key can be revoked by setting the api field in the ACL record to null.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.params.user 
Requesting user.
@returns {Promise<Object|Error>} A promise that resolves with a response object from the request or an error.
*/

export default async function apiKey(req, res) {
  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.');
  }

  if (!req.params.user) {
    return new Error('login_required');
  }

  // Get user from ACL.
  let rows = await acl(
    `
    SELECT * FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`,
    [req.params.user.email],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  const user = rows[0];

  if (!user?.api || !user.verified || !user.approved || user.blocked) {
    return res.status(401).send('Unauthorized access.');
  }

  // Create signed api_token
  const api_user = {
    api: true,
    email: user.email,
    roles: user.roles,
  };

  const key = jwt.sign(api_user, xyzEnv.SECRET, {
    algorithm: xyzEnv.SECRET_ALGORITHM,
  });

  // Store api_token in ACL.
  rows = await acl(
    `
    UPDATE acl_schema.acl_table SET api = '${key}'
    WHERE lower(email) = lower($1);`,
    [user.email],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  // Send ACL token.
  res.send(key);
}
