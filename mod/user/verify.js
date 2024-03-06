/**
 * ### verify

This module exports a function that gets triggers from an endpoint to verify and reset a user's password.
@module /user/verify
*/

const acl = require('./acl')

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

const login = require('./login')

/**
 * @function verify
 * @param {Object} req 
 * @param {Object} res 
 * @returns {Obect} res
 */
module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  // Find user record with matching verificationtoken.
  let rows = await acl(`
    SELECT email, language, approved, password_reset
    FROM acl_schema.acl_table
    WHERE verificationtoken = $1;`,
    [req.params.key])

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await languageTemplates({
      template: 'failed_query',
      language: req.params.language
    })

    return res.status(500).send(error_message)
  }

  const user = rows[0]

  if (!user) {

    const token_not_found = await languageTemplates({
      template: 'token_not_found',
      language: req.params.language
    })

    return res.status(302).send(token_not_found)
  }

  // Update user account in ACL with the approval token and remove verification token.
  rows = await acl(`
    UPDATE acl_schema.acl_table SET
      failedattempts = 0,
      ${user.password_reset ? `password = $3, password_reset = null,` : ''}
      verified = true,
      verificationtoken = null,
      language = $2
    WHERE lower(email) = lower($1);`, [user.email, req.params.language || user.language, user.password_reset])

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await languageTemplates({
      template: 'failed_query',
      language: req.params.language
    })

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
  rows = await acl(`
    SELECT email, language
    FROM acl_schema.acl_table
    WHERE admin = true;`)

  if (rows instanceof Error) {

    // Get error message from templates.
    const error_message = await languageTemplates({
      template: 'failed_query',
      language: req.params.language
    })

    return res.status(500).send(error_message)
  }

  // One or more administrator have been 
  if (rows.length > 0) {

    // Get array of mail promises.
    const mail_promises = rows.map(async row => {

      return await mailer({
        template: 'admin_email',
        language: row.language,
        to: row.email,
        email: user.email,
        host: `${req.headers.origin
          || req.headers.referer && new URL(req.headers.referer).origin
          || 'https://' + (process.env.ALIAS || req.headers.host)}${process.env.DIR}`
      })
    })

    // Continue after all mail promises have been resolved.
    Promise
      .allSettled(mail_promises)
      .then(async arr => {
        res.send(await languageTemplates({
          template: 'account_await_approval',
          language: user.language
        }))
      })
      .catch(error => console.error(error))

  } else {

    res.send(await languageTemplates({
      template: 'account_approved_no_admin',
      language: user.language
    }))
  }

}