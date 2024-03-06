/**
## User Key 🔑
The endpoint `/api/user/key` allows a user with the the api-key privileges to create an api key.
Each time this end point is run it will replace the key in the ACL.

> URL /api/user/key

### Example URL : 
```
https://yourdomain.com/api/user/key
```

### Example Response:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```
@module /user/key
*/

const acl = require('./acl')

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  // Get user from ACL.
  let rows = await acl(`
    SELECT * FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`, [req.params.user.email])
    
  if (rows instanceof Error) return res.status(500).send('Bad config.')
  
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

  const key = jwt.sign(api_user, process.env.SECRET)
 
  // Store api_token in ACL.
  rows = await acl(`
    UPDATE acl_schema.acl_table SET api = '${key}'
    WHERE lower(email) = lower($1);`, [user.email])
    
  if (rows instanceof Error) return res.status(500).send('Bad config.')
  
  // Send ACL token.
  res.send(key)
}