const acl = require('./acl')()

const mailer = require('../utils/mailer')

const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  const email = req.params.email.replace(/\s+/g, '')

  // Delete user account in ACL.
  var rows = await acl(`
    DELETE FROM acl_schema.acl_table
    WHERE lower(email) = lower($1)
    RETURNING *;`, [email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  // Sent email to inform user that their account has been deleted.
  var mail_template = await templates('deleted_account', user.language, {
    host,
    protocol
  })
  
  await mailer(Object.assign(mail_template, {
    to: user.email
  }))

  res.send('User account deleted.')
}