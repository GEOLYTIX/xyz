/**
## /user/update

Exports the [user] update method for the /api/user/cookie route.

@requires module:/user/acl
@requires module:/utils/mailer

@module /user/update
*/

import mailer from '../utils/mailer.js';
import acl from './acl.js';

/**
@function update

@description
The update method will send a request to the ACL to update a user record in the ACL.

The user object to update can be provided as request body.

Property values to be updated must be provided as a substitutes array to prevent SQL injection.

The update_user keys must be validated to contain white listed characters only to prevent SQL injection.

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
export default async function update(req, res) {
  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.');
  }

  if (!req.params.user?.admin) {
    // The update request can only be made by an administrator.
    return new Error('admin_user_login_required');
  }

  // Create update_user from request body or create Object with email from params.
  const update_user =
    Object.keys(req.body || {}).length === 0 || req.body === undefined
      ? { email: req.params.email }
      : req.body;

  //If the client has provided a request with a body/params that does not have an email we will return a 400
  if (!update_user.email) {
    return res.status(400).send('Email address required.');
  }

  if (req.params.field) {
    if (req.params.field === 'roles') {
      // The value string must be split into an array for the roles field params.
      req.params.value = req.params.value?.split(',') || [];
    }

    // Assign field property from request params.
    update_user[req.params.field] = req.params.value;
  }

  // Create ISODate for administrator request log.
  const ISODate = new Date().toISOString().replace(/\..*/, '');

  let password_reset = '';

  if (update_user.verified) {
    // Verifying a user will also approve the user, reset password, and failed login attempts.
    Object.assign(update_user, {
      approved: true,
      approved_by: `${req.params.user.email}|${ISODate}`,
      failedattempts: 0,
      password_reset: null,
      verificationtoken: null,
    });

    password_reset = `password = password_reset,`;
  }

  if (update_user.approved) {
    // Log who and when approved a user.
    update_user.approved_by = `${req.params.user.email}|${ISODate}`;
  }

  // Validate update_user keys.
  if (
    Object.keys(update_user).some((key) => !/^[A-Za-z0-9.,_-\s]*$/.test(key))
  ) {
    // Return bad request 400 if an update_user key contains not white listed characters.
    return res.status(400).send('Invalid key in user object for SQL update.');
  }

  const properties = [];
  const substitutes = [update_user.email];

  // Populate properties, substitutes array for update_query.
  Object.keys(update_user)
    .filter((key) => key !== 'email')
    .forEach((key) => {
      substitutes.push(update_user[key]);
      properties.push(`${key} = $${substitutes.length}`);
    });

  const update_query = `
    UPDATE acl_schema.acl_table
    SET 
      ${password_reset}
      ${properties.join(',')}
    WHERE lower(email) = lower($1);`;

  const rows = await acl(update_query, substitutes);

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  // Send email to the user account if an account has been approved.
  if (update_user.approved) {
    const approval_mail = {
      host: req.params.host,
      language: update_user.language,
      template: 'approved_account',
      to: update_user.email,
    };

    await mailer(approval_mail);
  }

  return res.send('Update success');
}
