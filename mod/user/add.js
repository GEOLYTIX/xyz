/**
@module /user/add
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

  const email = req.params.email.replace(/\s+/g, '')

  // Delete exsiting user account with same email in ACL.
  let rows = await acl(`
    SELECT email FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`, [email])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to query PostGIS table.')
  }

  if (rows[0]) {
    return res.send('User already exists in ACL.')
  }

  // Create new user account
  rows = await acl(`
    INSERT INTO acl_schema.acl_table (
      email,
      verified,
      approved )
    SELECT
      '${email}' AS email,
      true AS verified,
      true as approved;`)

  if (rows instanceof Error) {
    return res.status(500).send('Failed to add user account to ACL.')
  }

  res.send(`${email} added to ACL.`)
} 