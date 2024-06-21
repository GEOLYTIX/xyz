/**
## /user/register

Exports the [user] register method for the /api/user/register route.

@requires module:/view
@requires module:/user/acl
@requires module:/user/login
@requires module:/utils/reqHost
@requires module:/utils/mailer
@requires module:/utils/languageTemplates
@requires bcrypt
@requires crypto

@module /user/register
*/

const bcrypt = require('bcrypt')

const crypto = require('crypto')

const acl = require('./acl')

const reqHost = require('../utils/reqHost')

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

const view = require('../view')

/**
@function register

@description
Returns the user regestration or password reset form depending on the reset request parameter.

Returns the `registerUserBody` method with a request [user] body present.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {boolean} [req.params.reset]
Request password reset form.
@param {Object} [req.body] 
Post body object with user data.
*/

module.exports = async function register(req, res) {

  if (!acl) return res.status(500).send('ACL unavailable.')

  req.params.host = reqHost(req)

  // Register request [post] body.
  if (req.body) return registerUserBody(req, res)

  // The login view will set the cookie to null.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  req.params.template = req.params.reset
    ? 'password_reset_view'
    : 'register_view';  

  // Get request for registration form view.
  view(req, res)
}

const previousAddress = {}

/**
@function registerUserBody

@description
Will attempt to register the user object provided as request body as a new user.

An email with a verification token will be sent to verify a newly registered account.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.body 
Post body object with user data.
@param {string} req.body.email 
User account email.
*/

async function registerUserBody(req, res) {

  debounceRequest(req, res)

  if (res.finished) return;

  checkUserBody(req, res)

  if (res.finished) return;

  // The password will be reset for exisiting user accounts.
  await passwordReset(req, res)

  if (res.finished) return;

  // Get the date for logs.
  const date = new Date().toISOString().replace(/\..*/, '')

  const expiry_date = parseInt((new Date().getTime() + process.env.APPROVAL_EXPIRY * 1000 * 60 * 60 * 24) / 1000)

  // Create new user account
  const rows = await acl(`
    INSERT INTO acl_schema.acl_table (
      email,
      password,
      password_reset,
      language,
      ${process.env.APPROVAL_EXPIRY ? 'expires_on,' : ''}
      verificationtoken,
      access_log
    )

    SELECT
      '${req.body.email}' AS email,
      '${req.body.password}' AS password,
      '${req.body.password}' AS password_reset,
      '${req.body.language}' AS language,
      ${process.env.APPROVAL_EXPIRY? `${expiry_date} AS expires_on,` : ''}
      '${req.body.verificationtoken}' AS verificationtoken,
      array['${date}@${req.ips && req.ips.pop() || req.ip}'] AS access_log;`)

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }

  await mailer({
    template: 'verify_account',
    language: req.body.language,
    to: req.body.email,
    host: req.params.host,
    link: `${req.params.host}/api/user/verify/${req.body.verificationtoken}`,
    remote_address: req.params.remote_address
  })

  // Return msg. No redirect for password reset.
  res.send(await languageTemplates({
    template: 'new_account_registered',
    language: req.body.language
  }))
}

/**
@function debounceRequest

@description
The remote_address determined from the request header is stored in the previousAddress module variable. Requests from the same address within 30 seconds will be bounced.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.header
Request header.
*/

function debounceRequest(req, res) {

  req.params.remote_address = req.headers['x-forwarded-for']
    && /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'] : 'invalid'
    || 'unknown';

  // The remote_address has been previously used
  if (Object.hasOwn(previousAddress, req.params.remote_address)

    // within 30 seconds or less.
    && new Date() - previousAddress[req.params.remote_address] < 30000) {

    res.status(403).send(`Address ${req.params.remote_address} temporarily locked.`)

    return;
  }

  // Log the remote_address with the current datetime.
  previousAddress[req.params.remote_address] = new Date()
}

/**
@function checkUserBody

@description
A valid email address is required for the registration or password reset.

The ACL can be restricted for email addresses provided as `process.env.USER_DOMAINS`.

A valid password must be provided. Password rules can be defined as `process.env.PASSWORD_REGEXP`. The default rule for password being `'(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{10,}$'`.

The `req.body.password` will be hashed with bcrypt.

A `req.body.verificationtoken` will be created with crypto.

The `req.body.language` will be checked against Intl.Collator.supportedLocalesOf.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.body 
Post body object with user data.
@param {string} req.body.email 
A valid email must be provided.
@param {string} req.body.password 
A valid password must be provided.
*/

function checkUserBody(req, res) {

  if (!req.body.email) return res.status(400).send('No email provided')

  // Test email address
  if (!/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/.test(req.body.email)) {

    return res.status(400).send('Provided email address is invalid')
  }

  // Test whether email domain is allowed to register
  if (process.env.USER_DOMAINS) {

    // Get array of allowed user email domains from split environment variable.
    const domains = new Set(process.env.USER_DOMAINS.split(','))

    // Check whether the Set has the domain.
    if (!domains.has(req.body.email.match(/(?<=@)[^.]+(?=\.)/g)[0])) {

      // Return if not...
      return res.status(400).send('Provided email address is invalid');
    }
  }

  // Test whether a password has been provided.
  if (!req.body.password) return res.status(400).send('No password provided')

  // Create regex to text password complexity from env or set default.
  const passwordRgx = new RegExp(process.env.PASSWORD_REGEXP || '(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{10,}$')

  // Test whether the provided password is valid.
  if (!passwordRgx.test(req.body.password)) {

    res.status(403).send('Invalid password provided')
    return;
  }

  // Hash the password.
  req.body.password = bcrypt.hashSync(req.body.password, 8)

  // Create random verification token.
  req.body.verificationtoken = crypto.randomBytes(20).toString('hex')
  
  // Lookup the provided language key.
  req.body.language = Intl.Collator.supportedLocalesOf([req.body.language], { localeMatcher: 'lookup' })[0] || 'en';
}

/**
@function passwordReset

@description
The passwordReset method checks whether a user record exists for the email provided in the request body.

An email with a verification token will be sent to verify the password reset.

@param {Object} req HTTP request.
@param {Object} res HTTP response.
@param {Object} req.params 
Request parameter.
@param {Object} req.body 
Post body object with user data.
@param {string} req.body.email 
User account email.
*/

async function passwordReset(req, res) {

  // Attempt to retrieve ACL record with matching email field.
  let rows = await acl(`
      SELECT email, password, password_reset, language, blocked
      FROM acl_schema.acl_table 
      WHERE lower(email) = lower($1);`,
    [req.body.email])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }

  const user = rows[0]

  // Register new user.
  if (!user) return;

  // Setting the password to NULL will disable access to the account and prevent resetting the password.
  if (user?.password === null) {
    res.status(401).send('User account has restricted access')
    return;
  }

  // Blocked user may not reset their password.
  if (user.blocked) {
    res.status(403).send(await languageTemplates({
      template: 'user_blocked',
      language: req.body.language
    }))
    return;
  }

  // Get the date for logs.
  const date = new Date().toISOString().replace(/\..*/, '')

  const expiry_date = parseInt((new Date().getTime() + process.env.APPROVAL_EXPIRY * 1000 * 60 * 60 * 24) / 1000)

  const expires_on = process.env.APPROVAL_EXPIRY && user.expires_on
    ? `expires_on = ${expiry_date},` : ''

  // Set new password and verification token.
  // New passwords will only apply after account verification.
  rows = await acl(`
    UPDATE acl_schema.acl_table 
    SET
      ${expires_on}
      password_reset = '${req.body.password}',
      verificationtoken = '${req.body.verificationtoken}',
      access_log = array_append(access_log, '${date}@${req.params.remote_address}')
    WHERE lower(email) = lower($1);`,
    [req.body.email])

  if (rows instanceof Error) {
    return res.status(500).send('Failed to access ACL.')
  }

  // Sent mail with verification token to the account email address.  
  await mailer({
    template: 'verify_password_reset',
    language: req.body.language,
    to: user.email,
    host: req.params.host,
    link: `${req.params.host}/api/user/verify/${req.body.verificationtoken}/?language=${req.body.language}`,
    remote_address: req.params.remote_address
  })

  const password_reset_verification = await languageTemplates({
    template: 'password_reset_verification',
    language: req.body.language
  })

  res.send(password_reset_verification)
}