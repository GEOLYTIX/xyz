const acl = require('./acl')()

const mailer = require('../utils/mailer')

const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  // Remove spaces from email.
  const email = req.params.email.replace(/\s+/g, '')

  if (req.params.field === 'roles') {
    req.params.value = req.params.value.split(',')
  }

  // Get user to update from ACL.
  var rows = await acl(`
  UPDATE acl_schema.acl_table
  SET
    ${req.params.field} = $2
    ${req.params.field === 'approved'
      && `, approved_by = '${req.params.user.email}|${new Date().toISOString().replace(/\..*/,'')}'`
      || ''}
  WHERE lower(email) = lower($1);`, [email, req.params.value])

  if (rows instanceof Error) return res.status(500).send(await templates('failed_query', req.params.language))

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  // Send email to the user account if an account has been approved.
  if (req.params.field === 'approved' && req.params.value === 'true') {

    var mail_template = await templates('approved_account', req.params.user.language, {
      host: host,
      protocol: protocol
    })
    
    await mailer(Object.assign(mail_template, {
      to: email
    }))

  }

  return res.send(await templates('update_ok', req.params.user.language))
}