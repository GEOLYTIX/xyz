const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const jwt = require('jsonwebtoken')

const acl = require('./acl')()

const mailer = require('../utils/mailer')

const templates = require('../templates/_templates')

const { nanoid } = require('nanoid')

module.exports = async (req, res, _message) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  if (req.body) {

    const user = await post(req)

    const redirect = req.cookies && req.cookies[`${process.env.TITLE}_redirect`]

    if (user instanceof Error && redirect) return view(req, res, user.message)

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
  const message = await templates(req.params.msg || _message, req.params.language)

  if (!message && req.params.user) {

    res.setHeader('location', `${process.env.DIR}`)
    res.status(302).send()
    return;
  }

  view(req, res, message)
}

async function view(req, res, message) {

  // The redirect for a successful login.
  const redirect = req.url && decodeURIComponent(req.url).replace(/login\=true/, '')

  let template = await templates('login_view', req.params.language, {
    dir: process.env.DIR,
    msg: message || ' '
  })

  // Clear user token cookie.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  // Set cookie with redirect value.
  res.setHeader('Set-Cookie', `${process.env.TITLE}_redirect=${redirect};HttpOnly;Max-Age=60000;Path=${process.env.DIR || '/'}`)

  res.send(template)
}

async function post(req, res) {

  if(!req.body.email) return new Error(await templates('missing_email', req.params.language))
  
  if(!req.body.password) return new Error(await templates('missing_password', req.params.language))

  const date = new Date()

  // Get the protocol and host for account verification email.
  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  // Update access_log and return user record matched by email.
  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/,'')}@${req.headers['x-forwarded-for'] || 'localhost'}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password;`,
    [req.body.email])

  if (rows instanceof Error) return new Error(await templates('failed_query', req.params.language))

  // Get user record from first row.
  const user = rows[0]

  if (!user) return new Error(await templates('auth_failed', req.params.language))

  // Blocked user cannot login.
  if (user.blocked) return new Error(await templates('user_blocked', user.language || req.params.language))
  
  // Non admin accounts may expire.
  if (!user.admin && process.env.APPROVAL_EXPIRY) {

    // Get approvalDate for checking expiry.
    const approvalDate = user.approved_by && new Date(user.approved_by.replace(/.*\|/,''))
  
    // Check whether the approvalDate is valid.
    if (approvalDate instanceof Date && !isNaN(approvalDate.getDate())) {

      // Calculate the difference in days between approval and now.
      const dateNow = new Date();
      const diffTime = Math.abs(dateNow - approvalDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      // Check whether the difference exceeds the APPROVAL_EXPIRY
      if (parseInt(process.env.APPROVAL_EXPIRY) < diffDays) {

        // Remove user approval.
        if (user.approved) {

          // Remove approval of expired user account.
          var rows = await acl(`
            UPDATE acl_schema.acl_table
            SET approved = false
            WHERE lower(email) = lower($1);`,
            [req.body.email])
    
          if (rows instanceof Error) return new Error(await templates('failed_query', req.params.language))
        }
    
        return new Error(await templates('user_expired', user.language))
      }
    }
  }

  // Accounts must be verified and approved for login
  if (!user.verified || !user.approved) {

    var mail_template = await templates('failed_login', user.language, {
      host: host,
      protocol: protocol,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })
  
    await mailer(Object.assign(mail_template, {
      to: user.email
    }))

    return new Error(await templates('user_not_verified', user.language))
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
  
      if (rows instanceof Error) return new Error(await templates('failed_query', req.params.language))

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

  if (rows instanceof Error) return new Error(await templates('failed_query', req.params.language))

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

    if (rows instanceof Error) return new Error(await templates('failed_query', req.params.language))

    var mail_template = await templates('locked_account', user.language, {
      host: host,
      failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,
      protocol: protocol,
      verificationtoken: verificationtoken,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })
  
    await mailer(Object.assign(mail_template, {
      to: user.email
    }))

    return new Error(await templates('user_locked', user.language))
  }

  // Login has failed but account is not locked (yet).
  var mail_template = await templates('login_incorrect', user.language, {
    host: host,
    remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
  })

  await mailer(Object.assign(mail_template, {
    to: user.email
  }))

  return new Error(await templates('auth_failed', req.params.language))
}