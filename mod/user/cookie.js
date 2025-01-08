/**
## /user/cookie

Exports the [user] cookie method for the /api/user/cookie route.

@requires module:/user/acl
@requires module:/user/login
@requires jsonwebtoken
@requires mapp_env

@module /user/cookie
*/

const env = require('../../mapp_env.js')

const acl = require('./acl')

const login = require('./login')

const jwt = require('jsonwebtoken')

/**
@function cookie
@async

@description
The cookie method attempts to find a request cookie matching the `env.TITLE` variable.

The cookie will be destroyed [set to NULL] with detroy request parameter truthy.

The cookie method will use the jsonwebtoken library to verify the existing cookie.

If veriffied successfully a new token with updated user credentials will be signed.

The `env.SECRET` variable will be used to sign the token.

The `env.COOKIE_TTL` will be set as time to life for the cookie set on the response header.

The token user will be sent back to the client.

@param {req} req HTTP request.
@param {res} res HTTP response.
@property {Object} [req.cookies] The request cookies object.
@property {boolean} [req.params.destroy] URL parameter flag whether the cookie should be destroyed.
@property {boolean} [req.params.create] URL parameter flag whether a new cookie should be created.
*/
module.exports = async function cookie(req, res) {

  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.')
  }

  if (req.params.create) {
    return login(req, res)
  }

  const cookie = req.cookies && req.cookies[env.TITLE]

  if (!cookie) {
    return res.send(false);
  }

  if (req.params.destroy) {

    // Remove cookie.
    res.setHeader('Set-Cookie', `${env.TITLE}=null;HttpOnly;Max-Age=0;Path=${env.DIR || '/'}`)
    return res.send('This too shall pass')
  }

  // Verify current cookie
  jwt.verify(
    cookie,
    env.SECRET,
    async (err, payload) => {

      if (err) return err

      // Get updated user credentials from ACL
      const rows = await acl(`
        SELECT email, admin, language, roles, blocked
        FROM acl_schema.acl_table
        WHERE lower(email) = lower($1);`, [payload.email])

      if (rows instanceof Error) {
        res.setHeader('Set-Cookie', `${env.TITLE}=null;HttpOnly;Max-Age=0;Path=${env.DIR || '/'}`)
        return res.status(500).send('Failed to retrieve user from ACL');
      }

      const user = rows[0]

      // Assign title identifier to user object.
      user.title = env.TITLE

      if (user.blocked) {
        res.setHeader('Set-Cookie', `${env.TITLE}=null;HttpOnly;Max-Age=0;Path=${env.DIR || '/'}`)
        return res.status(403).send('Account is blocked');
      }

      delete user.blocked

      if (payload.session) {
        user.session = payload.session
      }

      const token = jwt.sign(user, env.SECRET, {
        expiresIn: parseInt(env.COOKIE_TTL)
      })

      const cookie = `${env.TITLE}=${token};HttpOnly;Max-Age=${env.COOKIE_TTL};Path=${env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

      res.setHeader('Set-Cookie', cookie)

      res.send(user)
    })
}