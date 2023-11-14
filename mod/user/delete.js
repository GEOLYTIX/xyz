const acl = require('./acl')()

const mailer = require('../utils/mailer')

module.exports = async (req, res) => {

  const email = req.params.email.replace(/\s+/g, '')

  // Delete user account in ACL.
  let rows = await acl(`
    DELETE FROM acl_schema.acl_table
    WHERE lower(email) = lower($1)
    RETURNING *;`, [email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  // Sent email to inform user that their account has been deleted.
  await mailer({
    template: 'deleted_account',
    language: user.language,
    to: user.email,
    host: `${req.headers.origin}${process.env.DIR}`
  })

  res.send('User account deleted.')
}