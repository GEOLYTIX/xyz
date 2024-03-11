/**
### fromACL

This module exports a function to authenticate a user based on a provided email and password.

@module /user/fromACL
*/

const bcrypt = require('bcrypt')

const crypto = require('crypto')

const mailer = require('../utils/mailer')

const reqHost = require('../utils/reqHost')

const languageTemplates = require('../utils/languageTemplates')

const acl = require('./acl')

/**
 * Exported function fromACL that will authenticate user. 
 * @function fromACL
 * @param {Object} req 
 * @returns {Obect} user
 */
module.exports = async (req) => {

  const request = {
    email: req.body?.email,
    password: req.body?.password,
    language: req.params.language,
    headers: req.headers
  }

  if (req.headers.authorization) {

    const user_string = Buffer.from(req.headers.authorization.split(" ")[1], 'base64').toString()

    const email_password = user_string.split(':')

    request.email = email_password[0]

    request.password = email_password[1]
  }

  request.remote_address = /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for'])
    ? req.headers['x-forwarded-for'] : undefined;

  if (!request.email) return new Error(await languageTemplates({
    template: 'missing_email',
    language: request.language
  }))

  if (!request.password) return new Error(await languageTemplates({
    template: 'missing_password',
    language: request.language
  }))

  request.date = new Date()

  // Get the host for the account verification email.
  request.host = reqHost(req)

  const user = await getUser(request)

  if (user === undefined) {

    // This will happen when a user has a null password.
    return new Error('auth_failed')
  }

  return user
}

/**
 * Function that will get the User from the ACL and update the access_log property.
 * @function getUser
 * @param {Object} request 
 * @returns {Object} user
 */
async function getUser(request) {

  // Update access_log and return user record matched by email.
  let rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${request.date.toISOString().replace(/\..*/, '')}@${request.remote_address}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password ${process.env.APPROVAL_EXPIRY ? ', expires_on;' : ';'}`,
    [request.email])

  if (rows instanceof Error) return new Error(await languageTemplates({
    template: 'failed_query',
    language: request.language
  }))

  // Get user record from first row.
  const user = rows[0]

  //If there is no user in the ACL do not throw error.
  if (!user) return;

  if (!user.password) return;

  // Blocked user cannot login.
  if (user.blocked) {
    return new Error(await languageTemplates({
      template: 'user_blocked',
      language: user.language
    }))
  }

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

    if (process.env.USER_SESSION) {

      user.session = crypto.randomBytes(10).toString('hex')

      rows = await acl(`
        UPDATE acl_schema.acl_table
        SET session = '${user.session}'
        WHERE lower(email) = lower($1)`,
        [request.email])

      // The ACL table may not have a session column.
      if (rows instanceof Error) {

        delete user.session
      }

    }

    return user
  }

  return await failedLogin(request)
}

/**
 * Function to check the exiry of the user.
 * @function userExpiry
 * @param {Object} user 
 * @param {Obejct} request 
 * @returns {boolean}
 */
async function userExpiry(user, request) {

  // Admin accounts do not not expire.
  if (user.admin) return false;

  // APPROVAL_EXPIRY is not configured.
  if (!process.env.APPROVAL_EXPIRY) return false;
  
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
 * Function to fail the login attempt of a user and increase the failed attempts on the ACL.
 * @function failedLogin
 * @param {Object} request 
 * @returns {Error} auth_failed
 */
async function failedLogin(request) {

  // Increase failed login attempts counter by 1.
  let rows = await acl(`
    UPDATE acl_schema.acl_table
    SET failedattempts = failedattempts + 1
    WHERE lower(email) = lower($1)
    RETURNING failedattempts;`, [request.email])

  if (rows instanceof Error) return new Error(await languageTemplates({
    template: 'failed_query',
    language: request.language
  }))

  // Check whether failed login attempts exceeds limit.
  if (rows[0]?.failedattempts >= parseInt(process.env.FAILED_ATTEMPTS || 3)) {

    // Create a verificationtoken.
    const verificationtoken = crypto.randomBytes(20).toString('hex')

    // Store verificationtoken and remove verification status.
    rows = await acl(`
      UPDATE acl_schema.acl_table
      SET
        verified = false,
        verificationtoken = '${verificationtoken}'
      WHERE lower(email) = lower($1);`, [request.email])

    if (rows instanceof Error) return new Error(await languageTemplates({
      template: 'failed_query',
      language: request.language
    }))

    await mailer({
      template: 'locked_account',
      language: request.language,
      to: request.email,
      host: request.host,
      failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,
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