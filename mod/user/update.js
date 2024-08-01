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

@param {req} req HTTP request.
@param {req} res HTTP response.

@property {Object} [req.body] 
HTTP Post request body containing the update information.
@property {Object} req.params 
HTTP request parameter.
@property {string} params.email 
User to update
@property {string} params.field 
User record field to update
@property {string} params.value 
Update value for user record field.
@property {Object} params.user 
Requesting user.
@property {boolean} user.admin 
Requesting user is admin.
*/
module.exports = async function update(req, res) {

  // acl module will export an empty require object without the ACL being configured.
  if (typeof acl !== 'function') {
    return res.status(500).send('ACL unavailable.')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_user_login_required')
  }

  //const update_user = getUpdateUser(req)

  const update_user = req.body || {
    email: req.params.email
  }

  if(req.params.field === 'roles') {
    req.params.value = req.params.value?.split(',') || [];
  }

  if (req.params.field) {

    update_user[req.params.field] = req.params.value
  }

  const ISODate = new Date().toISOString().replace(/\..*/, '');

  if (update_user.verified) {

    Object.assign(user, {
      password_reset: null,
      failedattempts: 0,
      verificationtoken: null,
      approved: true,
      approved_by: `${req.params.user.email}|${ISODate}`
    })
  }

  if (update_user.approved) {

    update_user.approved_by = `${req.params.user.email}|${ISODate}`
  }

  const params = []
  const substitutes = [update_user.email]

  Object.keys(update_user)
    .filter(key => key !== 'email')
    .forEach(key => {
      substitutes.push(update_user[key])
      params.push(`${key} = $${substitutes.length}`)
    })

  const password_reset = update_user.verified
    ? `password = password_reset,` : '';

  const update_query = `
    UPDATE acl_schema.acl_table
    SET 
      ${password_reset}
      ${params.join(',')}
    WHERE lower(email) = lower($1);`

  // Get user to update from ACL.
  const rows = await acl(update_query, substitutes);

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }
  
  // Send email to the user account if an account has been approved.
  if (update_user.approved) {

    const approval_mail = {
      template: 'approved_account',
      language: update_user.language,
      to: update_user.email,
      host: req.params.host
    }
   
    await mailer(approval_mail);
  }

  return res.send('Update success')
}

function getUpdateUser(req) {

  const user = req.body || {
    email: req.params.email
  }

  if(req.params.field === 'roles') {
    req.params.value = req.params.value?.split(',') || [];
  }

  if (req.params.field) {

    user[req.params.field] = req.params.value
  }

  const ISODate = new Date().toISOString().replace(/\..*/, '');

  if (user.verified) {

    Object.assign(user, {
      password_reset: null,
      failedattempts: 0,
      verificationtoken: null,
      approved: true,
      approved_by: `${req.params.user.email}|${ISODate}`
    })
  }

  if (user.approved) {

    Object.assign(user, {
      approved_by: `${req.params.user.email}|${ISODate}`
    })
  }

  return user
}