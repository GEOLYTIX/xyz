const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  const user = req.params.user

  if (user.from_token) return res.send('Token may not be generated from token authentication.')

  delete user.admin
  delete user.exp
  delete user.iat

  const token = jwt.sign(
    req.params.user,
    process.env.SECRET, {
      expiresIn: '8hr'
    })

  res.send(token)

}