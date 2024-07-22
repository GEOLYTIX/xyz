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
@param {Object} [req.body] 
User payload to update
*/

module.exports = async function update(req, res) {

  // acl module will export an empty require object without the ACL being configured.
  if (typeof acl !== 'function') {
    return res.status(500).send('ACL unavailable.')
  }

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

  const ISODate = new Date().toISOString().replace(/\..*/, '');
  let approved_by = '';
  let verification_by_admin = ''

  if (req.body) {
    
    // Set approved_by field when updating the approved field in record.
    approved_by = req.body.approved ? `approved_by = '${req.params.user.email}|${ISODate}'` : '';

    if (req.body.verified) verification_by_admin = `
      , password = password_reset
      , password_reset = NULL
      , failedattempts = 0
      , verificationtoken = NULL
      , approved = true
      , approved_by = '${req.params.user.email}|${ISODate}'
    `
    
    let updatedUser = Object.entries(req.body)
    .filter(i => i[0] !== 'email')
    .map(i => { return `${i[0]} = '${i[1]}'` })

    // Get user to update from ACL.
    const rows = await acl(`UPDATE acl_schema.acl_table
    SET ${updatedUser.join(', ')}
    ${verification_by_admin}
    ${approved_by}
    WHERE lower(email) = lower('${req.body.email}');`)

    if (rows instanceof Error) {
      return res.status(500).send('Failed to access ACL.')
    }

    // Send email to the user account if an account has been approved.
    if (req.body.approved) await mailer({
      template: 'approved_account',
      language: req.body.language,
      to: req.body.email,
      host: req.params.host
    })
    
    return res.send('Update success')
  
  }

  // Remove spaces from email.
  const email = req.params.email.replace(/\s+/g, '')

  if (req.params.field === 'roles') {
    req.params.value = req.params.value?.split(',') || []
  }

  

  // Set approved_by field when updating the approved field in record.
  approved_by = req.params.field === 'approved'
    ? `, approved_by = '${req.params.user.email}|${ISODate}'`
    : '';

  if (req.params.field === 'verified' && req.params.value === true) {

    verification_by_admin = `
      , password = password_reset
      , password_reset = NULL
      , failedattempts = 0
      , verificationtoken = NULL
      , approved = true
      , approved_by = '${req.params.user.email}|${ISODate}'
    `
  }

  // Get user to update from ACL.
  const rows = await acl(`
    UPDATE acl_schema.acl_table
    SET
      ${req.params.field} = $2
      ${verification_by_admin}
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