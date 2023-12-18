const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

const acl = require('./acl')

const { nanoid } = require('nanoid')

module.exports = async (req) => {

  let email = req.body?.email

  let password = req.body?.password

  if (req.headers.authorization) {

    let user_string = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString()

    let email_password = user_string.split(':')

    email ??= email_password[0]

    password ??= email_password[1]
  }

  const remote_address = req.headers['x-forwarded-for']
    && /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'] : 'invalid'
    || 'unknown';

  if (!email) return new Error(await languageTemplates({
    template: 'missing_email',
    language: req.params.language
  }))

  if (!password) return new Error(await languageTemplates({
    template: 'missing_password',
    language: req.params.language
  }))

  const date = new Date()

  // Get the host for the account verification email.
  const host = `${req.headers.origin
    || req.headers.referer && new URL(req.headers.referer).origin
    || 'https://' + (process.env.ALIAS || req.headers.host)}${process.env.DIR}`

  // Update access_log and return user record matched by email.
  let rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/, '')}@${remote_address}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password ${process.env.APPROVAL_EXPIRY ? ', expires_on;' : ';'}`,
    [email])

  if (rows instanceof Error) return new Error(await languageTemplates({
    template: 'failed_query',
    language: req.params.language
  }))

  // Get user record from first row.
  const user = rows[0]

  if (!user) return new Error('auth_failed')

  // Blocked user cannot login.
  if (user.blocked) return new Error(await languageTemplates({
    template: 'user_blocked',
    language: user.language || req.params.language
  }))

  // Non admin accounts may expire.
  if (!user.admin && process.env.APPROVAL_EXPIRY) {

    // User account has expired.
    if (user.expires_on !== null && user.expires_on < new Date() / 1000) {

      // Remove user approval.
      if (user.approved) {

        // Remove approval of expired user account.
        rows = await acl(`
          UPDATE acl_schema.acl_table
          SET approved = false
          WHERE lower(email) = lower($1);`,
          [email])

        if (rows instanceof Error) return new Error(await languageTemplates({
          template: 'failed_query',
          language: req.params.language
        }))
      }

      return new Error(await languageTemplates({
        template: 'user_expired',
        language: user.language
      }))

    }

  }

  // Accounts must be verified and approved for login
  if (!user.verified || !user.approved) {

    await mailer({
      template: 'failed_login',
      language: user.language,
      to: user.email,
      host: host,
      remote_address
    })

    return new Error('user_not_verified')
  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(password, user.password)) {

    // password must be removed after check
    delete user.password

    if (process.env.NANO_SESSION) {

      const nano_session = nanoid()

      user.session = nano_session

      rows = await acl(`
        UPDATE acl_schema.acl_table
        SET session = '${nano_session}'
        WHERE lower(email) = lower($1)`,
        [email])

      if (rows instanceof Error) return new Error(await languageTemplates({
        template: 'failed_query',
        language: req.params.language
      }))

    }

    return user
  }

  // password must be removed after check
  delete user.password

  // FAILED LOGIN
  // Password from login form does NOT match encrypted password in ACL!

  // Increase failed login attempts counter by 1.
  rows = await acl(`
    UPDATE acl_schema.acl_table
    SET failedattempts = failedattempts + 1
    WHERE lower(email) = lower($1)
    RETURNING failedattempts;`, [email])

  if (rows instanceof Error) return new Error(await languageTemplates({
    template: 'failed_query',
    language: req.params.language
  }))

  // Check whether failed login attempts exceeds limit.
  if (rows[0].failedattempts >= parseInt(process.env.FAILED_ATTEMPTS || 3)) {

    // Create a verificationtoken.
    const verificationtoken = crypto.randomBytes(20).toString('hex')

    // Store verificationtoken and remove verification status.
    rows = await acl(`
      UPDATE acl_schema.acl_table
      SET
        verified = false,
        verificationtoken = '${verificationtoken}'
      WHERE lower(email) = lower($1);`, [email])

    if (rows instanceof Error) return new Error(await languageTemplates({
      template: 'failed_query',
      language: req.params.language
    }))

    await mailer({
      template: 'locked_account',
      language: user.language,
      to: user.email,
      host: host,
      failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,
      verificationtoken: verificationtoken,
      remote_address
    })

    return new Error(await languageTemplates({
      template: 'user_locked',
      language: user.language
    }))
  }

  // Login has failed but account is not locked (yet).
  await mailer({
    template: 'login_incorrect',
    language: user.language,
    to: user.email,
    host: host,
    remote_address
  })

  return new Error('auth_failed')
}