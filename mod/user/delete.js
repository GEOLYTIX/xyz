const acl = require('../auth/acl')()

const mailer = require('../mailer')

module.exports = async (req, res) => {

  const email = req.params.email.replace(/\s+/g, '')

  // Delete user account in ACL.
  var rows = await acl(`
    DELETE FROM acl_schema.acl_table
    WHERE lower(email) = lower($1);`, [email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  // Sent email to inform user that their account has been deleted.
  await mailer({
    to: email,
    subject: `This ${host} account has been deleted.`,
    text: `You will no longer be able to log in to ${protocol}${host}`
  })

  res.send('User account deleted.')

}