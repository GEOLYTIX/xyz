const acl = require('./acl')()

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  // Get user from ACL.
  var rows = await acl(`
    SELECT * FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`, [req.params.user.email])
    
  if (rows instanceof Error) return res.status(500).send('Bad config.')
  
  const user = rows[0]
  
  if (!user || !user.api || user.api === 'false' || !user.verified || !user.approved || user.blocked) return res.status(401).send('Invalid token.')
  
  // Create signed api_token
  const api_user = {
    email: user.email,
    roles: [],
    api: true
  }

  const key = jwt.sign(
    api_user,
    process.env.SECRET)
 
  
  // Store api_token in ACL.
  var rows = await acl(`
    UPDATE acl_schema.acl_table SET api = '${key}'
    WHERE lower(email) = lower($1);`, [user.email])
    
  if (rows instanceof Error) return res.status(500).send('Bad config.')
  
  // Send ACL token.
  res.send(key)

}