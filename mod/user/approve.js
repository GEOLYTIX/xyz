const acl = require('./acl')()

const mailer = require('../mailer')

const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send(await templates('acl_unavailable', req.params.language))

  const admin = req.params.user

  // Find user record with matching approvaltoken.
  var rows = await acl(`
    SELECT email, language
    FROM acl_schema.acl_table 
    WHERE approvaltoken = $1;`,
    [req.params.key])

  if (rows instanceof Error) return res.status(500).send(await templates('failed_query', req.params.language))

  const user = rows[0]

  if (!user) return res.send(await templates('token_not_found', req.params.language))

  var rows = await acl(`
    UPDATE acl_schema.acl_table SET
      approved = true,
      approvaltoken = null,
      approved_by = '${admin.email}|${new Date().toISOString().replace(/\..*/,'')}'
    WHERE lower(email) = lower($1);`,
    [user.email])

  if (rows instanceof Error) return res.status(500).send(await templates('failed_query', req.params.language))

  // Create protocol and host for mail templates.
  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  var mail_template = await templates('approved_account', user.language, {
    host: host,
    protocol: protocol
  })

  await mailer(Object.assign(mail_template, {
    to: user.email
  }))

  // Return msg. No redirect for password reset.
  res.send(await templates('admin_approved', admin.language))
  
}