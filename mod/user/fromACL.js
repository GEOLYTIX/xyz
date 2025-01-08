/**
## fromACL

This module exports the fromACL method to request and validate a user from the ACL.

@requires module:/user/acl
@requires module:/utils/reqHost
@requires module:/utils/mailer
@requires module:/utils/languageTemplates
@requires module:/utils/bcrypt
@requires crypto
@requires mapp_env

@module /user/fromACL
*/

const bcrypt = require('../utils/bcrypt')

const crypto = require('crypto')

const env = require('../../mapp_env.js')

const acl = require('./acl')

if (acl === null) {
  module.exports = null;

} else {

  module.exports = fromACL
}

const reqHost = require('../utils/reqHost')

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

/**
@function fromACL
@async

@description
Creates a request object for the getUser(request) method argument.
The request.email and request.password are taken from the req.body or authorization header.

@param {Object} req The request object.
@param {string} [req.body.email] The email address of the user.
@param {string} [req.body.password] The password of the user.
@param {string} [req.params.language] The language for the user.
@param {Object} req.headers The request headers.
@param {string} [req.headers.authorization] The authorization header containing the email and password.

@returns {Promise<Object|Error>}
Validated user object or an Error if authentication fails.
*/
async function fromACL(req) {

  const request = {
    email: req.body?.email,
    password: req.body?.password,
    language: req.params.language,
    headers: req.headers,
    date: new Date(),
    host: reqHost(req)
  }

  if (req.headers.authorization) {

    const user_string = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString()

    const email_password = user_string.split(':')

    request.email = email_password[0]

    request.password = email_password[1]
  }

  // Get remote_address param from request headers.
  request.remote_address = /^[A-Za-z0-9.,_-\s]*$/
    .test(req.headers['x-forwarded-for'])
    ? req.headers['x-forwarded-for']
    : undefined;

  if (!request.email) return new Error(await languageTemplates({
    template: 'missing_email',
    language: request.language
  }))

  if (!request.password) return new Error(await languageTemplates({
    template: 'missing_password',
    language: request.language
  }))

  const user = await getUser(request)

  if (user === undefined) {

    // This will happen when a user has a null password.
    return new Error('auth_failed')
  }

  return user
}

/**
@function getUser

@description
Retrieves the user from the ACL and updates the access_log property.

Will call userExpiry method to check whether user approval has expired.

Will check whether the request.password matches stored user password.

Will call failedLogin method if user object can not be validated.

Returns a validated user object or Error.

@param {Object} request The request object.
@param {string} request.email The email address of the user.
@param {Date} request.date The current date and time.
@param {string} request.remote_address The IP address of the client.
@param {string} request.language The language for the user.
@param {string} request.host The host for the account verification email.
@returns {Promise<Object|Error>} A Promise that resolves with the user object, an Error, or null if the user is not found.
*/

async function getUser(request) {

  // Update access_log and return user record matched by email.
  let rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${request.date.toISOString().replace(/\..*/, '')}@${request.remote_address}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password ${env.APPROVAL_EXPIRY ? ', expires_on;' : ';'}`,
    [request.email])

  if (rows instanceof Error) return new Error(await languageTemplates({
    template: 'failed_query',
    language: request.language
  }))

  // Get user record from first row.
  const user = rows[0]

  // If there is no user in the ACL do not throw error.
  if (!user) return;

  // No password check is required.
  if (!user.password) return;

  // Blocked user cannot login.
  if (user.blocked) {
    return new Error(await languageTemplates({
      template: 'user_blocked',
      language: user.language
    }))
  }

  // Removes blocked.false flag from user object.
  delete user.blocked

  // Check whether the user approval may have expired.
  if (await userExpiry(user, request)) {

    return new Error(await languageTemplates({
      template: 'user_expired',
      language: user.language
    })) 
  }

  // Accounts must be verified and approved for login
  if (!user.verified || !user.approved) {

    await mailer({
      template: 'failed_login',
      language: user.language,
      to: user.email,
      host: request.host,
      remote_address: request.remote_address
    })

    return new Error('user_not_verified')
  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(request.password, user.password)) {

    // password must be removed after check
    delete user.password

    if (env.USER_SESSION) {

      // Create a random session token.
      user.session = crypto.randomBytes(10).toString('hex')

      // Store session token in ACL.
      rows = await acl(`
        UPDATE acl_schema.acl_table
        SET session = '${user.session}'
        WHERE lower(email) = lower($1)`,
        [request.email])

      // The ACL table may not have a session column.
      if (rows instanceof Error) {

        return new Error('Unable to store session.')
      }

    }

    return user
  }

  return await failedLogin(request)
}

/**
@function userExpiry
@async

@description
Checks whether an user approval has expired if enabled with `env.APPROVAL_EXPIRY`.

A user account will expire if the user object has an expires_on integer data which is smaller than the current Date.

The approval will be removed from the user record in the ACL.

Admin user accounts do not expire.

@param {Object} user The user object.
@param {Object} request The request object.
@param {string} request.email - The email address of the user.
@param {string} request.language - The language for the user.
@returns {Promise<boolean>} A Promise that resolves with a boolean indicating if the user account has expired.
*/

async function userExpiry(user, request) {

  // Admin accounts do not not expire.
  if (user.admin) return false;

  // APPROVAL_EXPIRY is not configured.
  if (!env.APPROVAL_EXPIRY) return false;
  
  // Check whether user is expired.
  if (user.expires_on !== null && user.expires_on < new Date() / 1000) {

    if (user.approved) {

      // Remove approval of expired user.
      await acl(`
        UPDATE acl_schema.acl_table
        SET approved = false
        WHERE lower(email) = lower($1);`,
        [request.email])
    }

    // User approval has expired.
    return true;
  }
}

/**
@function failedLogin
@async

@description
Handles a failed login attempts.

Increases a counter of failed attempts in the user ACL record.

The user account will be locked if the failed attempts exceed the maxFailed attempts from `env.FAILED_ATTEMPTS`. maxFailed attempts defaults to 3.

Verification will be removed and a verification token will stored in the ACL if a user account is getting locked.

An email with the verification token is sent to the user notifying that the account has been locked and asking to renew verification.

It is recommended to reset the password for the account if this happens.

@param {Object} request The request object.
@param {string} request.email The email address of the user.
@param {string} request.language The language for the user.
@param {string} request.host The host for the account verification email.
@param {string} request.remote_address The IP address of the client.

@returns {Promise<Error>} A Promise that resolves with an Error.
*/

const maxFailedAttempts = parseInt(env.FAILED_ATTEMPTS)

async function failedLogin(request) {

  // Increase failed login attempts counter by 1.
  let rows = await acl(`
    UPDATE acl_schema.acl_table
    SET failedattempts = failedattempts + 1
    WHERE lower(email) = lower($1)
    RETURNING failedattempts;`, [request.email])

  if (rows instanceof Error) {
    return new Error(await languageTemplates({
      template: 'failed_query',
      language: request.language
    }))
  }

  // Check whether failed login attempts exceeds limit.
  if (rows[0]?.failedattempts >= maxFailedAttempts) {

    // Create a verificationtoken.
    const verificationtoken = crypto.randomBytes(20).toString('hex')

    // Store verificationtoken and remove verification status.
    rows = await acl(`
      UPDATE acl_schema.acl_table
      SET
        verified = false,
        verificationtoken = '${verificationtoken}'
      WHERE lower(email) = lower($1);`, [request.email])

    if (rows instanceof Error) {
      return new Error(await languageTemplates({
        template: 'failed_query',
        language: request.language
      }))
    }

    await mailer({
      template: 'locked_account',
      language: request.language,
      to: request.email,
      host: request.host,
      failed_attempts: maxFailedAttempts,
      remote_address: request.remote_address,
      verificationtoken
    })

    return new Error(await languageTemplates({
      template: 'user_locked',
      language: request.language
    }))
  }

  // Login has failed but account is not locked (yet).
  await mailer({
    template: 'login_incorrect',
    language: request.language,
    to: request.email,
    host: request.host,
    remote_address: request.remote_address
  })

  return new Error('auth_failed')
}