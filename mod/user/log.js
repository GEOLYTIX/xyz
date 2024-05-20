/**
@module /user/log
*/

const acl = require('./acl')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  if (!req.params.email) {

    return res.status(500).send('Missing email param')
  }

  if (!req.params.user) {

    return new Error('login_required')
  }

  if (!req.params.user?.admin) {

    return new Error('admin_required')
  }

  const rows = await acl(`
  SELECT access_log
  FROM acl_schema.acl_table
  WHERE lower(email) = lower($1);`,[req.params.email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)

}