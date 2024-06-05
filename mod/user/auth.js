/**
## /user/auth

The auth module is required by the XYZ API for request authorization.

A user_sessions{} object is declared in the module to store user sessions.

@module /user/auth
*/

const jwt = require('jsonwebtoken')

const acl = require('./acl')

const fromACL = require('./fromACL')

const user_sessions = {}

/**
### auth(req)

The auth method returns a user object to be assigned as request parameter if a request is successfully authenticated.

Requests with authorization headers will return the user fromACL method.

Without a request parameter token [eg. API key], the token value will be extracted from a request cookie matching the TITLE environment variable.

The token will be verified by the JWT [jsonwebtoken] library.

With a valid signature the token will be resolved as a user object by the verify method.

The auth method checks either the request parameter token or user.session if enabled.

@function auth
@param {Object} req 
HTTP request.
@param {Object} req.headers 
Request headers.
@param {Object} [req.headers.authorization] 
User authorization object.
@param {Object} req.params 
Request parameter.
@param {string} [req.params.token] 
Authorization token.
@param {Object} [req.cookies] 
Request cookies.
@param {Object} res 
HTTP response.
@return {Object} 
User
*/

module.exports = async function auth(req, res) {

  if (req.headers.authorization) {

    return await fromACL(req)
  }

  // Get token from params or cookie.
  const token = req.params.token || req.cookies && req.cookies[process.env.TITLE]

  // Return if there is no token to decode
  if (!token) return null

  // Verify the token signature.
  return jwt.verify(
    token,
    process.env.SECRET,
    async (err, user) => {

    // Return error if verification fails.
    if (err) return err

    // The token was provided as param.
    if (req.params.token) {

      // Check token
      const token = await checkToken(req.params.token, user)

      if (token instanceof Error) {

        // The token check has failed.
        return token
      }

      // Check whether the token matches cookie.
      if (req.cookies?.[process.env.TITLE] !== token) {

        // Create and assign a new cookie for the user.
        const cookie = jwt.sign(user, process.env.SECRET)

        res.setHeader('Set-Cookie',
          `${process.env.TITLE}=${cookie};HttpOnly;Max-Age=${user.exp && (user.exp - user.iat) || process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)
      }

    } else {

      // Check user.session
      // Not applicable for requests with token.
      const session = await checkSession(user)

      if (session instanceof Error) {

        // The session check has failed.
        return session
      }
    }

    return user
  })

}

/**
### checkSession(user)

Will check the user.session if enabled with USER_SESSION environment variable.

Returns the session key or Error if the check has failed.

@function checkSession
@param {Object} user
@return {string} user.session
*/

async function checkSession(user) {

  // USER_SESSION has not been enabled.
  if (!process.env.USER_SESSION) return;

  // A user.session must be provided if enabled.
  if (!user.session) {

    return new Error('No user.session provided.')
  }

  // The session token is stored in the user_session object.
  if (Object.hasOwn(user_sessions, user.email)) {

    // The stored session doesn't match the token user session.
    if (user_sessions[user.email] !== user.session) {

      // Delete the user_session
      delete user_sessions[user.email]
    }
  }

  if (!Object.hasOwn(user_sessions, user.email)) {

    // Get session from the ACL.
    const rows = await acl(`
      SELECT session
      FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`,
      [user.email])

    // The request for the stored session has failed.
    if (rows instanceof Error) return rows

    if (user.session !== rows[0].session) {

      // The stored session doesn't match user.session.
      return new Error('Session ID mismatch')
    }

    // Store user.session in user_sessions object.
    user_sessions[user.email] = user.session
  }

  return user.session
}

/**
### checkToken(req, user)

Checks the request parameter token.

@function checkToken
@param {string} token Authorization token.
@param {Object} user
*/

async function checkToken(token, user) {

  // The user object has an API key.
  if (user.api) {

    // Retrieve stored API key from ACL.
    const rows = await acl(`
      SELECT api, blocked
      FROM acl_schema.acl_table
      WHERE lower(email) = lower($1);`, [user.email])

    // The request for the stored API key has failed.
    if (rows instanceof Error) return rows

    if (rows.blocked) {
      
      // The user is blocked.
      return new Error('Account is blocked')
    }

    if (rows[0].api !== token) {

      // API keys do not expire.
      // The stored key must match the request param token.
      return new Error('API Key mismatch')
    }
  }

  // Token access must not have admin rights.
  delete user.admin

  // Flag the user to be created from a token.
  // It must not be possible created a new token from a token user.
  user.from_token = true

  return token
}