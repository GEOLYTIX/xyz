const login = require('../user/login')

const jwt = require('jsonwebtoken')

const acl = require('./acl')()

module.exports = async (req, res, access) => {

  req.params.token = req.params.token || req.cookies && req.cookies[`XYZ ${process.env.COOKIE || process.env.TITLE || 'token'}`]

  Object.entries(req.params).filter(entry => typeof entry[1] === 'string').forEach(entry => {
    req.params[entry[0]] = decodeURIComponent(entry[1])
  })

  if (access && !req.params.token) return login(req, res)

  if (!req.params.token && !process.env.PRIVATE) return

  if (!req.params.token) return login(req, res)


  // Verify token (checks token expiry)
  jwt.verify(req.params.token, process.env.SECRET, async (err, token) => {

    if (err) return res.status(401).send('Invalid token.');

    token.signed = req.params.token

    req.params.token = token

    // Token must have an email
    if (!token.email) return res.status(401).send('Invalid token.');

    if (token.api) {

      // Get user from ACL.
      var rows = await acl(`
        SELECT * FROM acl_schema.acl_table
        WHERE lower(email) = lower($1);`, [token.email]);

      if (rows instanceof Error) return res.status(500).send('Bad Config.');

      const user = rows[0];

      if (!user || !user.api || (user.api !== req.params.token)) return res.status(401).send('Invalid token.');

      // Create a private token with 10second expiry.
      const api_token = {
        email: user.email,
        roles: user.roles
      }
      
      api_token.signed = jwt.sign(
        api_token,
        process.env.SECRET,
        {
          expiresIn: 10
        });

      req.params.token = api_token

      return
    }

    if (!access || access === 'login') return

    // Check admin_user privileges.
    if (access === 'key' && token.key) return

    // Check admin_user privileges.
    if (access === 'admin_user' && token.admin_user) return

    // Check admibn_workspace privileges.
    if (access === 'admin_workspace' && token.admin_workspace) return

    res.status(401).send('Invalid token.');
  });

};