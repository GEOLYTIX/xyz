const jwt = require('jsonwebtoken')

const acl = require('./acl')()

module.exports = async (req, res) => {

  // Get token from params or cookie.
  const token = req.params.token || req.cookies && req.cookies[process.env.TITLE]

  if (!token) return null

  // Verify the token signature.
  return jwt.verify(
    token,
    process.env.SECRET,
    async (err, user) => {

    if (err) return err

    // Token access must not have any admin rights. 
    if (req.params.token) {

      if (user.api) {

        // Get API key from ACL.
        var rows = await acl(`
          SELECT api FROM acl_schema.acl_table
          WHERE lower(email) = lower($1);`, [user.email])

        if (rows instanceof Error) return rows

        if (rows[0].api !== req.params.token) return new Error('API Key mismatch')
      }

      delete user.admin

      user.from_token = true

      if (req.cookies && req.cookies[process.env.TITLE] !== req.params.token) {

        const cookie = jwt.sign(user, process.env.SECRET)

        res.setHeader('Set-Cookie', `${process.env.TITLE}=${cookie};HttpOnly;Max-Age=${user.exp && (user.exp - user.iat) || 28800};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)
      }

    }

    return user
  })

}