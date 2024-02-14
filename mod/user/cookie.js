const login = require('./login')

const jwt = require('jsonwebtoken')

const acl = require('./acl')

module.exports = async (req, res) => {

  const cookie = req.cookies && req.cookies[process.env.TITLE]

  if (!cookie) {
    req.params.msg = 'no_cookie_found'
    return login(req, res)
  }

  if (req.params.destroy) {

    // Remove cookie.
    res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
    return res.send('This too shall pass')
  }

  // Verify current cookie
  jwt.verify(
    cookie,
    process.env.SECRET,
    async (err, payload) => {

      if (err) return err

      // Get updated user credentials from ACL
      let rows = await acl(`
        SELECT email, admin, language, roles, blocked
        FROM acl_schema.acl_table
        WHERE lower(email) = lower($1);`, [payload.email])
    
      if (rows instanceof Error) {
        res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
        return res.status(500).send('Failed to retrieve user from ACL');
      }

      const user = rows[0]
    
      if (user.blocked) {
        res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)
        return res.status(403).send('Account is blocked');
      }

      if (payload.session) {

        user.session = payload.session
      }

      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

      const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=${process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

      res.setHeader('Set-Cookie', cookie)

      res.send(user)
    })

}