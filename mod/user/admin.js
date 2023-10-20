const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  // Get admin view template.
  const adminView = await templates('user_admin_view', 'en', {
    dir: process.env.DIR,
    user: req.params.user.email
  })

  res.send(adminView)
}