/**
## /user/log

Exports the [user] access log method for the /api/user/log route.

@requires module:/user/acl

@module /user/log
*/

import acl from './acl.js';

/**
@function accessLog

@description
/api/user/log?email=dennis@geolytix.co.uk

The accessLog method is routed by the User API module.

The method must be requested by a user with admin priviliges or by a user wanting to access their own record.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {string} req.params.email 
Email to add.
@param {Object} req.params.user 
Requesting user.
@param {boolean} req.params.user.admin 
Requesting user is admin.
*/

export default async function accessLog(req, res) {
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

  const email = req.params.email.replace(/\s+/g, '');

  // Admin priviliges are required for the user access log.
  if (!req.params.user?.admin) {
    // A user may request their own access log.
    if (req.params.user?.email !== email) {
      return new Error('admin_required');
    }
  }

  const rows = await acl(
    `
    SELECT access_log
    FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`,
    [req.params.email],
  );

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  // return 204 if no record was returned from database.
  if (!rows?.length) {
    return res.status(204).send('No rows returned from table.');
  }

  // Send the infoj object with values back to the client.
  res.send((rows.length === 1 && rows[0]) || rows);
}
