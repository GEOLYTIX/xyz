const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

const msg_templates = require('../msg_templates')

const crypto = require('crypto')

const acl = require('./acl')()

module.exports = async (req, res) => {

  // Find user account in ACL from matching token.
  var rows = await acl(`SELECT * FROM acl_schema.acl_table WHERE verificationtoken = $1;`, [req.params.key])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  if (!user) return res.send(msg_templates.account_not_found[user.language || 'en'] || msg_templates.account_not_found.en)

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

      // Create an array of all admin account emails.
      //let adminmail = rows.map(admin => admin.email)

      let admins = rows.map(admin => { return {email: admin.email, language: (admin.language || 'en')}});

      //let admin_language = rows.map(admin => (admin.language || 'en'));

      const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

      const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}` 

      for(let i = 0; i < admins.length; i++){

        let admin_mail = mail_templates.admin_email[admins[i].language] || mail_templates.admin_email.en;

        await mailer(Object.assign({
          to: admins[i].email
        },
        admin_mail({
          email: user.email,
          host: host,
          protocol: protocol,
          approvaltoken: approvaltoken
        })));
      }

      /*admins.forEach(admin => {

        let admin_mail = mail_templates.admin_email[admin.language] || mail_templates.admin_email.en;

        mailer(Object.assign({
          to: admin.email
        },
        admin_mail({
          email: user.email,
          host: host,
          protocol: protocol,
          approvaltoken: approvaltoken
        })));
      });   */

      // Sent an email to all admin account emails with a request to approve the new user account.
      /*await mailer({
        bcc: adminmail,
        subject: `A new account has been verified on ${host}`,
        text: `Please log into the admin panel ${protocol}${host}/view/admin_user to approve ${user.email}
        You can also approve the account by following this link: ${protocol}${host}/api/user/approve/${approvaltoken}`
      })*/

    }

    return res.send(msg_templates.account_await_approval[user.language || 'en'] || msg_templates.account_await_approval.en)
  }

  // Return on password reset; Do NOT notify administrator
  if (user.password_reset) return res.send(msg_templates.password_reset_ok[user.language || 'en'] || msg_templates.password_reset_ok.en)

}