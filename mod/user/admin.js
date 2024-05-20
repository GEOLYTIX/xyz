const view = require('../view')

module.exports = async (req, res) => {

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

  req.params.template = 'user_admin_view'
  req.params.language = req.params.user.language
  req.params.user = req.params.user.email
  view(req, res)
}