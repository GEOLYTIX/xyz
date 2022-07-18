const acl = require('./acl')()

module.exports = async (req, res) => {

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
    blocked
  FROM acl_schema.acl_table;`)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table @ mod/user/list.js')

  // return 204 if no record was returned from database.
  if (!rows || !rows.length) return res.status(202).send('No rows returned from table.')

  rows = rows.length === 1 && rows[0] || rows

  process.env.APPROVAL_EXPIRY && rows.forEach(user => {

    const dateNow = new Date()

    const approvalDate = user.approved_by && new Date(user.approved_by.replace(/.*\|/,''))

    if (!user.admin && approvalDate instanceof Date && !isNaN(approvalDate.getDate())) {

      const diffTime = Math.abs(dateNow - approvalDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      user.expires_in = parseInt(process.env.APPROVAL_EXPIRY) - diffDays
    }
    
  });

  // Send the infoj object with values back to the client.
  res.send(rows)
}