/**
## /user/add

Exports the addUser method for the /api/user/add route.

@requires module:/user/acl

@module /user/add
*/

import acl from './acl.js';

/**
@function addUser

@description
The `/api/user/add?email=dennis@geolytix.co.uk` endpoint requests to add the email param as a new record to the ACL.

The addUser method is routed by the User API module.

The method must be requested by a user with admin priviliges.

The request will return if the user already exists.

Otherwise a new user record for the email provided as parameter will be added to the ACL.

The new user added to the ACL via the [user] add method will automatically be verified and approved by the requesting admin user.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@property {Object} req.params Request parameter.
@property {string} params.email Email to add.
@property {Array<string>} [params.roles] Optional array of role keys to assign.
@property {Object} params.user Requesting user.
@property {boolean} user.admin Requesting user is admin.
*/

export default async function addUser(req, res) {
  // acl module will export an empty require object without the ACL being configured.
  if (acl === null) {
    return res.status(500).send('ACL unavailable.');
  }

  if (!req.params.email) {
    return res.status(500).send('Missing email param');
  }

  if (!req.params.user) {
    return new Error('login_required');
  }

  if (!req.params.user?.admin) {
    return new Error('admin_required');
  }

  const email = req.params.email.replace(/\s+/g, '');

  // Check for exsiting user account with same email in ACL.
  let rows = await acl(
    `
    SELECT email FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`,
    [email],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  if (rows[0]) {
    return res.send('User already exists in ACL.');
  }

  // Build parameterized insert query and values.
  const columns = ['email', 'verified', 'approved'];
  const values = [email, true, true];

  if (typeof req.params.roles === 'string') {
    // Create roles array from string param.
    const roles = req.params.roles
      .split(',')
      .map((role) => role.trim())
      .filter((role) => role.length > 0);

    columns.push('roles');
    values.push(roles);
  }

  const placeholders = values.map((_, i) => `$${i + 1}`);

  // Insert user account into ACL.
  rows = await acl(
    `
    INSERT INTO acl_schema.acl_table (${columns.join(', ')})
    VALUES (${placeholders.join(', ')});`,
    values,
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to add user account to ACL.');
  }

  res.send(`${email} added to ACL.`);
}
