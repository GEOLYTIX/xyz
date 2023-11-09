const view = require('../view')

module.exports = async (req, res) => {

  req.params.template = 'user_admin_view'
  req.params.language = req.params.user.language
  req.params.user = req.params.user.email

  view(req, res)
}