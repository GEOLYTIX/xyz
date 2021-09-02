const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  let template = await templates('user_admin_view', 'en', {
    dir: process.env.DIR
  })

  res.send(template)
}