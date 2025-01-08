/**
## /user/key 🔑

Exports the apiKey method for the /api/user/key route.

@requires module:/user/acl
@requires jsonwebtoken
@requires mapp_env

@module /user/key
*/

const env = require('../utils/processEnv.js')

const acl = require('./acl')

const jwt = require('jsonwebtoken')

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
*/

module.exports = async function apiKey(req, res) {

  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.')
  }

  if (!req.params.user) {

    return new Error('login_required')
  }

  // Get user from ACL.
  let rows = await acl(`
    SELECT * FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`, [req.params.user.email])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }

  const user = rows[0]

  if (!user || !user.api || !user.verified || !user.approved || user.blocked) {
    return res.status(401).send('Unauthorized access.')
  }

  // Create signed api_token
  const api_user = {
    email: user.email,
    roles: user.roles,
    api: true
  }

  const key = jwt.sign(api_user, env.SECRET)

  // Store api_token in ACL.
  rows = await acl(`
    UPDATE acl_schema.acl_table SET api = '${key}'
    WHERE lower(email) = lower($1);`,
    [user.email])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }

  // Send ACL token.
  res.send(key)
}