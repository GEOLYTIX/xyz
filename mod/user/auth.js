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

    // API keys have an api flag in the decoded token.
    // if (user.api) {

    //   // Get user from ACL.
    //   var rows = await acl(`
    //     SELECT * FROM acl_schema.acl_table
    //     WHERE lower(email) = lower($1);`, [user.email])

    //   if (rows instanceof Error) return rows

    //   const api_user = rows[0]

    //   // Check whether the stored key matches the provided key.
    //   if (!api_user || !api_user.api || (api_user.api !== token)) {
    //     return new Error('API Key mismatch')
    //   }
            
    //   return {
    //     email: api_user.email,
    //     roles: api_user.roles
    //   }
    // }

    // Token access must not have any admin rights. 
    if (req.params.token) {

      delete req.params.key
      delete req.params.token
      delete user.admin
      user.from_token = true

      if (req.cookies && req.cookies[process.env.TITLE]) return user

      const cookie = jwt.sign(user, process.env.SECRET)

      res.setHeader('Set-Cookie', `${process.env.TITLE}=${cookie};HttpOnly;Max-Age=${user.exp - user.iat};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)
    }

    return user
  })

}