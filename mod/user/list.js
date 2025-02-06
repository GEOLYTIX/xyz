/**
## /user/list

Exports the [user] list method for the /api/user/list route.

@requires module:/user/acl
@requires module:/utils/processEnv

@module /user/list
*/

import acl from './acl.js';

/**
@function list

@description
/api/user/list returns a list of all ACL records.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params.user 
Requesting user.
@param {boolean} req.params.user.admin 
Requesting user is admin.
*/

export default async (req, res) => {
  if (!req.params.user) {
    return new Error('login_required');
  }

  if (!req.params.user?.admin) {
    return new Error('admin_required');
  }

  let rows = await acl(`
    SELECT
      email,
      verified,
      approved,
      admin,
      length(api)::boolean AS api,
      roles,
      language,
      access_log[array_upper(access_log, 1)],
      failedattempts,
      approved_by,
      ${xyzEnv.APPROVAL_EXPIRY ? 'expires_on,' : ''}
      blocked,
      verificationtoken
    FROM acl_schema.acl_table
    ORDER BY email;`);

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.');
  }

  // return 204 if no record was returned from database.
  if (!rows?.length) {
    return res.status(202).send('No rows returned from table.');
  }

  // rows must be returned as an array.
  rows = (rows.length === 1 && rows[0]) || rows;

  // Send the infoj object with values back to the client.
  res.send(rows);
};
