const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

const messages = require('./messages')

const crypto = require('crypto')

const acl = require('./acl')()

module.exports = async (req, res) => {

  // Find user account in ACL from matching token.
  var rows = await acl(`SELECT * FROM acl_schema.acl_table WHERE verificationtoken = $1;`, [req.params.key])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  if (!user) return res.send(messages.account_not_found[req.params.language || 'en'] ||
    `No matching account found.`)

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

  // Notify administrator if user needs to be approved.
  if (!user.approved) {

    // Get all admin accounts from the ACL.
    var rows = await acl('SELECT * FROM acl_schema.acl_table WHERE admin_user = true;')

    if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

    if (rows.length > 0) {

      let admins = rows.map(row => ({
        email: row.email,
        language: row.language || 'en'
      }))

      const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

      const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

      for (let i = 0; i < (admins.length -1); i++) {

        const admin = admins[i]

        var mail_template = mail_templates.admin_email[admin.language]

        await mailer(Object.assign({
          to: admin.email
        },
        mail_template({
          email: user.email,
          host: host,
          protocol: protocol,
          approvaltoken: approvaltoken
        })))

      }

      // admins.forEach(async admin => {

      //   var mail_template = mail_templates.admin_email[admin.language]

      //   await mailer(Object.assign({
      //     to: admin.email
      //   },
      //   mail_template({
      //     email: user.email,
      //     host: host,
      //     protocol: protocol,
      //     approvaltoken: approvaltoken
      //   })))

      // })

    }

    return res.send(messages.account_await_approval[user.language || req.params.language || 'en'] ||
      `This account has been verified but requires administrator approval.`)
  }

  // Return on password reset; Do NOT notify administrator
  if (user.password_reset) return res.send(messages.password_reset_ok[user.language || req.params.language || 'en'] ||
    `Password has been reset.`)

}