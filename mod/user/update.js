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
  
  let update_query = '';
  let mailer_options = {};

  const verified = req.body ? req.body.verified : (req.params.field === 'verified' && req.params.value === true);

  const verification_by_admin = verified ? `
  , password = password_reset
  , password_reset = NULL
  , failedattempts = 0
  , verificationtoken = NULL
  , approved = true
  , approved_by = '${req.params.user.email}|${ISODate}'
  ` : ``;

  const approved = req.body ? req.body.approved : (req.params.field === 'approved' && req.params.value === true);

  const approved_by = approved ? `approved_by = '${req.params.user.email}|${ISODate}'` : '';


  // payload in the request
  if (req.body) {

    
    let updatedUser = Object.entries(req.body)
    .filter(i => i[0] !== 'email')
    .map(i => { return `${i[0]} = '${i[1]}'` })

    update_query = `UPDATE acl_schema.acl_table
    SET ${updatedUser.join(', ')}
    ${verification_by_admin}
    ${approved_by}
    WHERE lower(email) = lower('${req.body.email}');`

    mailer_options = {
      template: 'approved_account',
      language: req.body.language,
      to: req.body.email,
      host: req.params.host
    }
  
  }
  // no payload
  else {

    // Remove spaces from email.
    const email = req.params.email.replace(/\s+/g, '');

    if(req.params.field === 'roles') {
      req.params.value = req.params.value?.split(',') || [];
    }

    update_query = `
      UPDATE acl_schema.acl_table
      SET
      ${req.params.field} = ${req.params.value}
      ${verification_by_admin}
      ${approved_by}
      WHERE lower(email) = lower(${email});`
      
    mailer_options = {
      template: 'approved_account',
      language: req.params.user.language,
      to: email,
      host: req.params.host
    };

  }

  // Get user to update from ACL.
  const rows = await acl(update_query);

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }
  
  // Send email to the user account if an account has been approved.
  if (approved) {
   
    await mailer(mailer_options);
  }

  return res.send('Update success')
}