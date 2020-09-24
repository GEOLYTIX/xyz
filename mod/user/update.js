const acl = require('./acl')()

const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

module.exports = async (req, res) => {

  console.log(req.params);

  // Remove spaces from email.
  const email = req.params.email.replace(/\s+/g, '')

  if (req.params.field === 'roles') {
    req.params.value = `'{"${req.params.value.replace(/\s+/g, '').split(',').join('","')}"}'`
  }

  // Get user to update from ACL.
  var rows = await acl(`
  UPDATE acl_schema.acl_table
  SET
    ${req.params.field} = ${req.params.value === 'false' && 'NULL' || req.params.value}
    ${req.params.field === 'approved'
      && `, approvaltoken = null, approved_by = '${req.params.token.email}|${new Date().toISOString().replace(/\..*/,'')}'`
      || ''}
  WHERE lower(email) = lower($1);`, [email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  // Send email to the user account if an account has been approved.
  if (req.params.field === 'approved' && req.params.value === 'true') {

    const approved_account_mail = mail_templates.approved_account[req.params.token.language || 'en'] || mail_templates.approved_account.en;

    await mailer(Object.assign({
      to: email
    },
    approved_account_mail({
      host: host,
      protocol: protocol
    })));

  }

  return res.send('Update successful')
}