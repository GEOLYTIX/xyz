const login = require('./login')

const messages = require('./messages')

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  const cookie = req.cookies && req.cookies[process.env.TITLE]

  if (!cookie) return login(req, res, messages.no_cookie_found[req.params.language || 'en'] || `No cookie relating to this application found on request`)

  jwt.verify(
    cookie,
    process.env.SECRET,
    async (err, user) => {

      if (err) return err

      user.iat = new Date(user.iat * 1000)
      user.exp = new Date(user.exp * 1000)

      res.send(user)

    })

}