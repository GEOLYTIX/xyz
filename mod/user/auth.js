const jwt = require('jsonwebtoken')

const acl = require('./acl')

const fromACL = require('./fromACL')

const user_sessions = {}

module.exports = async (req, res) => {

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

    // user [nano] sessions are enabled in the env.
    if (process.env.NANO_SESSION) {

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
        let rows = await acl(`
        SELECT session
        FROM acl_schema.acl_table
        WHERE lower(email) = lower($1);`,
          [user.email])

        if (rows instanceof Error) return rows

        // The session stored in the ACL doesn't match the token user session.
        if (user.session !== rows[0].session) return new Error('Session ID mismatch')

        // Store the user.session in the user_sessions object.
        user_sessions[user.email] = user.session
      }
    }

    // The token was provided as param.
    if (req.params.token) {

      // and is an api key.
      if (user.api) {

        // Retrieve the original api key for the user from ACL.
        let rows = await acl(`
          SELECT api, blocked
          FROM acl_schema.acl_table
          WHERE lower(email) = lower($1);`, [user.email])

        if (rows instanceof Error) return rows

        if (rows.blocked) return new Error('Account is blocked')

        // API key do not expire and must therefore match the copy in the ACL to allow for retraction.
        if (rows[0].api !== req.params.token) return new Error('API Key mismatch')
      }

      // Token access must not have admin rights.
      delete user.admin

      // Flag the user to be created from a token.
      // It must not be possible created a new token from a token user.
      user.from_token = true

      // Check whether the token matches the params token.
      if (req.cookies && req.cookies[process.env.TITLE] !== req.params.token) {

        // Create and assign a new cookie from the token user.
        const cookie = jwt.sign(user, process.env.SECRET)
        
        res.setHeader('Set-Cookie', `${process.env.TITLE}=${cookie};HttpOnly;Max-Age=${user.exp && (user.exp - user.iat) || process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)
      }

    }

    return user
  })

}