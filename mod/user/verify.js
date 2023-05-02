const crypto = require('crypto')

const acl = require('./acl')()

const mailer = require('../utils/mailer')

const templates = require('../templates/_templates')

const login = require('./login')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  // Find user record with matching verificationtoken.
  var rows = await acl(`
    SELECT email, language, approved, password_reset
    FROM acl_schema.acl_table
    WHERE verificationtoken = $1;`,
    [req.params.key])

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await templates('failed_query', req.params.language)
    
    return res.status(500).send(error_message)
  }

  const user = rows[0]

  if (!user) {

    res.setHeader('location', `${process.env.DIR}?msg=token_not_found`)

    return res.status(302).send()
  }

  // Update user account in ACL with the approval token and remove verification token.
  var rows = await acl(`
    UPDATE acl_schema.acl_table SET
      failedattempts = 0,
      ${user.password_reset ?
        `password = '${user.password_reset}',
        password_reset = null,` : ''}
      verified = true,
      verificationtoken = null
    WHERE lower(email) = lower($1);`, [user.email])

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await templates('failed_query', req.params.language)
    
    return res.status(500).send(error_message)
  }

  if (user.approved) {

    // Login with message if account is approved and password reset.
    if (user.password_reset) {
      res.setHeader('location', `${process.env.DIR}?msg=password_reset_ok`)

      return res.status(302).send()
    }

    return login(req, res)
  }

  // Get all admin accounts from the ACL.
  var rows = await acl(`
    SELECT email, language
    FROM acl_schema.acl_table
    WHERE admin = true;`)

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await templates('failed_query', req.params.language)

    return res.status(500).send(error_message)
  }

  // One or more administrator have been 
  if (rows.length > 0) {

    // Create protocol and host for mail templates.
    const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
    const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

    // Get array of mail promises.
    const mail_promises = rows.map(async row => {

      const mail_template = await templates('admin_email', row.language || req.params.language, {
        email: user.email,
        host: host,
        protocol: protocol
      })

      // Assign email to mail template.
      Object.assign(mail_template, {
        to: row.email
      })
      
      return mailer(mail_template)
    })

    // Continue after all mail promises have been resolved.
    Promise
      .all(mail_promises)
      .then(async arr => res.send(await templates('account_await_approval', user.language)))
      .catch(error => console.error(error))

  }

}