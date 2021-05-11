const crypto = require('crypto')

const acl = require('./acl')()

const mailer = require('../mailer')

const mails = require('./mails')

const mail = (m, lang) => mails[m] && (mails[m][lang] || mails[m].en)

const messages = require('./messages')

const msg = (m, lang) => messages[m] && (messages[m][lang] || messages[m].en) || m

const login = require('./login')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send(msg('acl_unavailable', req.params.language))

  // Find user record with matching verificationtoken.
  var rows = await acl(`
    SELECT email, language, approved, password_reset
    FROM acl_schema.acl_table
    WHERE verificationtoken = $1;`,
    [req.params.key])

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  const user = rows[0]

  if (!user) return res.send(msg('account_not_found', req.params.language))
  
  // Create a random approval token.
  const approvaltoken = crypto.randomBytes(20).toString('hex')

  // Update user account in ACL with the approval token and remove verification token.
  var rows = await acl(`
    UPDATE acl_schema.acl_table SET
      failedattempts = 0,
      ${user.password_reset ?
        `password = '${user.password_reset}',
        password_reset = null,` : ''}
      verified = true,
      ${!user.approved ? `approvaltoken = '${approvaltoken}',` : ''}
      verificationtoken = null
    WHERE lower(email) = lower($1);`, [user.email])

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  if (user.approved) {

    // Login with message if account is approved and password reset.
    if (user.password_reset) {
      res.setHeader('location', `${process.env.DIR}`)

      return res.status(302).send()
    }

    return login(req, res)

  }

  // Get all admin accounts from the ACL.
  var rows = await acl(`
    SELECT email, language
    FROM acl_schema.acl_table
    WHERE admin = true;`)

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  // One or more administrator have been 
  if (rows.length > 0) {

    // Create protocol and host for mail templates.
    const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
    const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

    // Get array of mail promises.
    const mail_promises = rows.map(row => {

      const mail_template = mail('admin_email', row.language || req.params.language)
       
      return mailer(Object.assign({
        to: row.email
      },
      mail_template({
        email: user.email,
        host: host,
        protocol: protocol,
        approvaltoken: approvaltoken
      })))
    })

    // Continue after all mail promises have been resolved.
    Promise
      .all(mail_promises)
      .then(arr => res.send(msg('account_await_approval', user.language)))
      .catch(error => console.error(error))

  }

}