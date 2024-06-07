/**
## /user/update

Exports the [user] update method for the /api/user/cookie route.

@requires module:/user/acl
@requires module:/utils/mailer

@module /user/update
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

/**
@function update

@description
The update method will send a request to the ACL to set param.field = param.value for the param.email user record.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {string} req.params.email 
User to update
@param {string} req.params.field 
User record field to update
@param {string} req.params.value 
Update value for user record field.
@param {Object} req.params.user 
Requesting user.
@param {boolean} req.params.user.admin 
Requesting user is admin.
*/

module.exports = async function update(req, res) {

  if (!acl) return res.status(500).send('ACL unavailable.')

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

  // Remove spaces from email.
  const email = req.params.email.replace(/\s+/g, '')

  if (req.params.field === 'roles') {
    req.params.value = req.params.value?.split(',') || []
  }

  const ISODate = new Date().toISOString().replace(/\..*/, '')

  // Set approved_by field when updating the approved field in record.
  const approved_by = req.params.field === 'approved'
    ? `, approved_by = '${req.params.user.email}|${ISODate}'`
    : '';

  // Get user to update from ACL.
  const rows = await acl(`
    UPDATE acl_schema.acl_table
    SET
      ${req.params.field} = $2
      ${approved_by}
    WHERE lower(email) = lower($1);`,
    [email, req.params.value])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }
  
  // Send email to the user account if an account has been approved.
  if (req.params.field === 'approved' && req.params.value === true) {
   
    await mailer({
      template: 'approved_account',
      language: req.params.user.language,
      to: email,
      host: req.params.host
    })
  }

  return res.send('Update success')
}