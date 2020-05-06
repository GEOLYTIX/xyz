const acl = require('../auth/acl')()

const mailer = require('../mailer')

module.exports = async (req, res) => {

  // Remove spaces from email.
  const email = req.params.email.replace(/\s+/g, '')

  if (req.params.field === 'roles') {
    req.params.value = `'{"${req.params.value.replace(/\s+/g, '').split(',').join('","')}"}'`
  }

  // Get user to update from ACL.
  var rows = await acl(`
  UPDATE acl_schema.acl_table
  SET
    ${req.params.field} = ${req.params.value === 'false' && 'NULL' || req.params.value},
    approved_by = '${req.params.token.email}'
  WHERE lower(email) = lower($1);`, [email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  // Send email to the user account if an account has been approved.
  if (req.params.field === 'approved' && req.params.value === 'true') {
    await mailer({
      to: email,
      subject: `This account has been approved for ${host}`,
      text: `You are now able to log on to ${protocol}${host}`
    })

  }

  return res.send('Update successful')
}