/**
## /user/admin

Exports a User API route for the admin view with user checks.

@module /user/admin
*/

const view = require('../view')

/**
### admin(req, res)

/api/user/admin

The admin function checks whether the request parameter user has admin priviliges before returnig the View API with the admin view as template.

@function admin
@param {Object} req 
HTTP request.
@param {Object} res 
HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.params.user 
Requesting user.
@param {boolean} req.params.user.admin 
Requesting user is admin.
*/

module.exports = async function admin(req, res) {

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
