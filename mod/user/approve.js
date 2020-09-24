const acl = require('./acl')()

const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

module.exports = async (req, res) => {

  var rows = await acl(`SELECT * FROM acl_schema.acl_table WHERE approvaltoken = $1;`, [req.params.key])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  if (!user) return res.send('Token not found. The token has probably been resolved already.')

  var rows = await acl(`
  UPDATE acl_schema.acl_table SET
    approved = true,
    approvaltoken = null,
    approved_by = '${req.params.token.email}|${new Date().toISOString().replace(/\..*/,'')}'
  WHERE lower(email) = lower($1);`, [user.email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  const approved_account_mail = mail_templates.approved_account[user.language || 'en'] || mail_templates.approved_account.en;

  await mailer(Object.assign({
    to: user.email
  },
  approved_account_mail({
    host: host,
    protocol: protocol
  })));

  res.send('The account has been approved by you. An email has been sent to the account holder.')

}