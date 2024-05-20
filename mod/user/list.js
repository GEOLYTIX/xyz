/**
### List Users

This module provides an endpoint to return a list of users from the ACL.

@module /user/list
*/

const acl = require('./acl')

/**
 * > Optional Params : email
 * @function export
 * @param {Object} req 
 * @param {Object} res 
 * @returns {acl} acl
 */
module.exports = async (req, res) => {

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
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
      ${process.env.APPROVAL_EXPIRY ? 'expires_on,' : ''}
      blocked,
      verificationtoken
    FROM acl_schema.acl_table
    ${req.params.email ? `WHERE email='${req.params.email}'`: ''}
    ORDER BY email;`)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  // rows must be returned as an array.
  rows = rows.length === 1 && rows[0] || rows

  // Send the infoj object with values back to the client.
  res.send(rows)
}