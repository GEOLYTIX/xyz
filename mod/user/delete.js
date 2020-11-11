const acl = require('./acl')()

const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

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
  const deleted_account_mail = mail_templates.deleted_account[user.language || 'en'] ||  mail_templates.deleted_account.en;

  await mailer(Object.assign({
    to: user.email
  },
  deleted_account_mail({
    host: host,
    protocol: protocol
  })));

  res.send('User account deleted.')

}