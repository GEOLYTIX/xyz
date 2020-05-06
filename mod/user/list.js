const acl = require('../auth/acl')()

module.exports = async (req, res) => {

  const rows = await acl(`
  SELECT
    email,
    verified,
    approved,
    admin_user,
    admin_workspace,
    length(api)::boolean AS api,
    roles,
    access_log[array_upper(access_log, 1)],
    failedattempts,
    approved_by,
    blocked
  FROM acl_schema.acl_table;`)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // return 204 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  // Send the infoj object with values back to the client.
  res.send(rows.length === 1 && rows[0] || rows)

}