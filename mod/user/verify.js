const mailer = require('../mailer')

const crypto = require('crypto')

const acl = require('../auth/acl')()

module.exports = async (req, res) => {

  // Find user account in ACL from matching token.
  var rows = await acl(`SELECT * FROM acl_schema.acl_table WHERE verificationtoken = $1;`, [req.params.key])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  if (!user) return res.send('No matching account found.')

  const approvaltoken = crypto.randomBytes(20).toString('hex')

  // Update user account in ACL.
  var rows = await acl(`
    UPDATE acl_schema.acl_table SET
      failedattempts = 0,
      ${user.password_reset ? `password = '${user.password_reset}', password_reset = null,` : ''}
      verified = true,
      ${!user.approved ? `approvaltoken = '${approvaltoken}',` : ''}
      verificationtoken = null
    WHERE lower(email) = lower($1);`, [user.email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  // Return on password reset; Do NOT notify administrator
  if (user.password_reset) return res.send('Password has been reset.')

  // Notify administrator if user needs to be approved.
  if (!user.approved) {

    // Get all admin accounts from the ACL.
    var rows = await acl('SELECT email FROM acl_schema.acl_table WHERE admin_user = true;')

    if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

    if (rows.length > 0) {

      // Create an array of all admin account emails.
      let adminmail = rows.map(admin => admin.email)

      const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

      const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`    

      // Sent an email to all admin account emails with a request to approve the new user account.
      await mailer({
        bcc: adminmail,
        subject: `A new account has been verified on ${host}`,
        text: `Please log into the admin panel ${protocol}${host}/view/admin_user to approve ${user.email}
        You can also approve the account by following this link: ${protocol}${host}/api/user/approve/${approvaltoken}`
      })

    }

    return res.send('This account has been verified but requires administrator approval.')
  }

}