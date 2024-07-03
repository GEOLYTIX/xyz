/**
## /user/put

Exports the [user] put method for the /api/user/cookie route.

@requires module:/user/acl
@requires module:/utils/mailer

@module /user/put
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

/**
@function put

@description
The update method will send a request to the ACL to update existing user records immediately from payload.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} [req.body] 
User payload to update
*/

module.exports = async function put(req, res) {

  if (!acl) return res.status(500).send('ACL unavailable.')

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

  // Remove spaces from email.
  // not sure this is necessary as email is validated and within body
  //const email = req.params.email.replace(/\s+/g, '')

  // need to include support for it later once the form supports it
  /*if (req.params.field === 'roles') {
    req.params.value = req.params.value?.split(',') || []
  }*/

  const ISODate = new Date().toISOString().replace(/\..*/, '')

  // Set approved_by field when updating the approved field in record.
  const approved_by = req.body.approved
    ? `approved_by = '${req.params.user.email}|${ISODate}'`
    : '';

  let verification_by_admin = ''

  if (req.body.verified) {

    verification_by_admin = `
      password = password_reset
      , password_reset = NULL
      , failedattempts = 0
      , verificationtoken = NULL
      , approved = true
      , approved_by = '${req.params.user.email}|${ISODate}'
    `
  }

  let updates = Object.entries(req.body)
  .filter(i => i[0] !== 'email')
  .map(i => {
    return `${i[0]} = ${i[1]}`;
  })

  updates.push(verification_by_admin)
  updates.push(approved_by);

  // Get user to update from ACL.
  const rows = await acl(`
    UPDATE acl_schema.acl_table
    SET ${updates.join(', ')}
    WHERE lower(email) = lower(${req.body.email});`)

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }
  
  // Send email to the user account if an account has been approved.
  if (req.body.approved) {
   
    await mailer({
      template: 'approved_account',
      language: req.body.language,
      to: email,
      host: req.params.host
    })
  }

  return res.send('Update success')
}