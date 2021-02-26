const acl = require('./acl')()

const mailer = require('../mailer')

const mails = require('./mails')

const mail = (m, lang) => mails[m] && (mails[m][lang] || mails[m].en)

const messages = require('./messages')

const msg = (m, lang) => messages[m] && (messages[m][lang] || messages[m].en) || m

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send(msg('acl_unavailable', req.params.language))

  const admin = req.params.user

  // Find user record with matching approvaltoken.
  var rows = await acl(`
    SELECT email, language
    FROM acl_schema.acl_table 
    WHERE approvaltoken = $1;`,
    [req.params.key])

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  const user = rows[0]

  if (!user) return res.send(msg('token_not_found', req.params.language))

  var rows = await acl(`
    UPDATE acl_schema.acl_table SET
      approved = true,
      approvaltoken = null,
      approved_by = '${admin.email}|${new Date().toISOString().replace(/\..*/,'')}'
    WHERE lower(email) = lower($1);`,
    [user.email])

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  // Create protocol and host for mail templates.
  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  // Sent mail to user account to confirm approval.
  const mail_template = mail('approved_account', user.language)

  await mailer(Object.assign({
      to: user.email
    },
    mail_template({
      host: host,
      protocol: protocol
    })))

  // Return msg. No redirect for password reset.
  res.send(msg('admin_approved', admin.language))
  
}