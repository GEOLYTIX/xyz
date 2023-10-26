const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const jwt = require('jsonwebtoken')

const acl = require('./acl')()

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

const view = require('../view')

const { nanoid } = require('nanoid')

module.exports = async (req, res, _message) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  if (req.body) {

    const user = await post(req)

    const redirect = req.cookies && req.cookies[`${process.env.TITLE}_redirect`]

    if (user instanceof Error && redirect) {

      req.params.msg = user.message
      
      loginView(req, res)
      return 
    }

    if (user instanceof Error) return res.status(401).send(user.message)

    // Create token with 8 hour expiry.
    const token = jwt.sign(
      {
        email: user.email,
        admin: user.admin,
        language: user.language,
        roles: user.roles,
        session: user.session
      },
      process.env.SECRET,
      {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

    const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=${process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

    res.setHeader('Set-Cookie', cookie)

    res.setHeader('location', `${redirect && redirect.replace(/([?&]{1})msg={1}[^&]+(&|$)/,'') || process.env.DIR}`)

    return res.status(302).send()

  }

  // Get message from templates.
  const message = await languageTemplates(req.params.msg || _message, req.params.language)

  if (!message && req.params.user) {

    res.setHeader('location', `${process.env.DIR}`)
    res.status(302).send()
    return;
  }

  req.params.msg = message || ' '

  loginView(req, res)
}

async function loginView(req, res) {

  // Clear user token cookie.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  // The redirect for a successful login.
  const redirect = req.url && decodeURIComponent(req.url).replace(/login\=true/, '')

  // Set cookie with redirect value.
  res.setHeader('Set-Cookie', `${process.env.TITLE}_redirect=${redirect};HttpOnly;Max-Age=60000;Path=${process.env.DIR || '/'}`)

  req.params.template = 'login_view'

  view(req, res)
}

async function post(req, res) {

  const remote_address = req.headers['x-forwarded-for']
    && /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'] : 'invalid'
    || 'unknown';

  if(!req.body.email) return new Error(await languageTemplates('missing_email', req.params.language))
  
  if(!req.body.password) return new Error(await languageTemplates('missing_password', req.params.language))

  const date = new Date()

  // Get the protocol and host for account verification email.
  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  // Update access_log and return user record matched by email.
  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/,'')}@${remote_address}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password ${process.env.APPROVAL_EXPIRY ? ', expires_on;' : ';'}`,
    [req.body.email])

  if (rows instanceof Error) return new Error(await languageTemplates('failed_query', req.params.language))

  // Get user record from first row.
  const user = rows[0]

  if (!user) return new Error(await languageTemplates('auth_failed', req.params.language))

  // Blocked user cannot login.
  if (user.blocked) return new Error(await languageTemplates('user_blocked', user.language || req.params.language))
  
  // Non admin accounts may expire.
  if (!user.admin && process.env.APPROVAL_EXPIRY) {

    // User account has expired.
    if (user.expires_on !== null && user.expires_on < new Date()/1000) {

      // Remove user approval.
      if (user.approved) {

        // Remove approval of expired user account.
        var rows = await acl(`
          UPDATE acl_schema.acl_table
          SET approved = false
          WHERE lower(email) = lower($1);`,
          [req.body.email])
          
        if (rows instanceof Error) return new Error(await languageTemplates('failed_query', req.params.language))
      }

      return new Error(await languageTemplates('user_expired', user.language))

    }

  }

  // Accounts must be verified and approved for login
  if (!user.verified || !user.approved) {
 
    await mailer({
      template: 'failed_login',
      language: user.language,
      to: user.email,
      host: host,
      protocol: protocol,
      remote_address
    })

    return new Error(await languageTemplates('user_not_verified', user.language))
  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(req.body.password, user.password)) {

    // password must be removed after check
    delete user.password

    if (process.env.NANO_SESSION) {

      const nano_session = nanoid()

      user.session = nano_session

      var rows = await acl(`
      UPDATE acl_schema.acl_table
      SET session = '${nano_session}'
      WHERE lower(email) = lower($1)`,
      [req.body.email])
  
      if (rows instanceof Error) return new Error(await languageTemplates('failed_query', req.params.language))

    }

    return user
  }

  // password must be removed after check
  delete user.password

  // FAILED LOGIN
  // Password from login form does NOT match encrypted password in ACL!

  // Increase failed login attempts counter by 1.
  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET failedattempts = failedattempts + 1
    WHERE lower(email) = lower($1)
    RETURNING failedattempts;`, [req.body.email])

  if (rows instanceof Error) return new Error(await languageTemplates('failed_query', req.params.language))

  // Check whether failed login attempts exceeds limit.
  if (rows[0].failedattempts >= parseInt(process.env.FAILED_ATTEMPTS || 3)) {

    // Create a verificationtoken.
    const verificationtoken = crypto.randomBytes(20).toString('hex')

    // Store verificationtoken and remove verification status.
    var rows = await acl(`
      UPDATE acl_schema.acl_table
      SET
        verified = false,
        verificationtoken = '${verificationtoken}'
      WHERE lower(email) = lower($1);`, [req.body.email])

    if (rows instanceof Error) return new Error(await languageTemplates('failed_query', req.params.language))
 
    await mailer({
      template: 'locked_account',
      language: user.language,
      to: user.email,
      host: host,
      failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,
      protocol: protocol,
      verificationtoken: verificationtoken,
      remote_address
    })

    return new Error(await languageTemplates('user_locked', user.language))
  }

  // Login has failed but account is not locked (yet).
  await mailer({
    template: 'login_incorrect',
    language: user.language,
    to: user.email,
    host: host,
    remote_address
  })

  return new Error(await languageTemplates('auth_failed', req.params.language))
}