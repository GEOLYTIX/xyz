const login = require('./login')

const jwt = require('jsonwebtoken')

const acl = require('./acl')()

module.exports = async (req, res, access) => {

  // Get token from params or cookie.
  req.params.token = req.params.token || req.cookies && req.cookies[`XYZ ${process.env.TITLE || 'token'}`]

  // Requests without token must terminate before validation.
  if (!req.params.token) {

    // Requests with restricted access return a login screen in order to generate a token.
    if (access) return login(req, res)

    // Requests without restricted access on a public instance may proceed without token validation.
    if (!process.env.PRIVATE) return

    // Proceed with login to generate a token.
    return login(req, res)
  }

  // Verify token (checks token expiry).
  jwt.verify(req.params.token.signed || req.params.token, process.env.SECRET, async (err, token) => {

    //if (err) return res.status(401).send('Invalid token.')

    if (err) return login(req, res)

    if (token.msg) return login(req, res, token.msg)

    token.signed = req.params.token

    req.params.token = token

    // Token must have an email.
    if (!token.email) return res.status(401).send('Invalid token.')

    // API keys have an api flag in the decoded token.
    if (token.api) {

      // Get user from ACL.
      var rows = await acl(`
        SELECT * FROM acl_schema.acl_table
        WHERE lower(email) = lower($1);`, [token.email])

      if (rows instanceof Error) return res.status(500).send('Bad Config.')

      const user = rows[0];

      // Check whether the stored key matches the provided key.
      if (!user || !user.api || (user.api !== req.params.token)) return res.status(401).send('Invalid token.')

      // Create a private token with 10second expiry.
      // A key may be public and must not have any admin flags.
      const api_token = {
        email: user.email,
        roles: user.roles
      }
      
      api_token.signed = jwt.sign(
        api_token,
        process.env.SECRET,
        {
          expiresIn: 10
        })

      req.params.token = api_token

      return
    }

    // Token access must not have any admin rights. 
    if (!access || access === 'login') {

      // Set cookie from valid token if no cookie present on request.
      if (!req.cookies || !req.cookies[`XYZ ${process.env.TITLE || 'token'}`]) {
        delete token.admin_user
        delete token.admin_workspace
        token.signed = jwt.sign(
          token,
          process.env.SECRET)

        res.setHeader('Set-Cookie', `XYZ ${process.env.TITLE || 'token'}=${token.signed};HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)
      }
      
      return
    }

    // Check admin_user privileges.
    if (access === 'key' && token.key) return

    // Check admin_user privileges.
    if (access === 'admin_user' && token.admin_user) return

    // Check admibn_workspace privileges.
    if (access === 'admin_workspace' && token.admin_workspace) return

    res.status(401).send('Invalid token.')
  })

}