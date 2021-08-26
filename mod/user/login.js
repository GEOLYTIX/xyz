const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const jwt = require('jsonwebtoken')

const { readFileSync } = require('fs')

const { join } = require('path')

const acl = require('./acl')()

const mailer = require('../mailer')

const mails = require('./mails')

const mail = (m, lang) => mails[m] && (mails[m][lang] || mails[m].en)

const messages = require('./messages')

const msg = (m, lang) => messages[m] && (messages[m][lang] || messages[m].en) || m

const { nanoid } = require('nanoid')

module.exports = async (req, res, message) => {

  if (!acl) return res.status(500).send(msg('acl_unavailable', req.params.language))

  if (req.body && req.body.login) {

    const user = await post(req)

    if (user instanceof Error && req.body.redirect) return view(req, res, user.message)

    if (user instanceof Error) return res.status(401).send(user.message)

    // Create token with 8 hour expiry.
    const token = jwt.sign({
        email: user.email,
        admin: user.admin,
        language: req.body.language || user.language,
        roles: user.roles,
        session: user.session
      },
      process.env.SECRET, {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

    const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=${process.env.COOKIE_TTL};Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

    res.setHeader('Set-Cookie', cookie)

    if (!req.body.redirect) return res.send(user)

    res.setHeader('location', `${req.body.redirect.replace(/([?&])msg=[^&]+(&|$)/,'')}`)

    return res.status(302).send()

  }

  message = msg(req.params.msg || message, req.params.language)

  view(req, res, message)
}

function view(req, res, message) {

  let template

  // The template should be read inside the view handler.
  try {

    // Attempt to read a language spcific login view template.
    //template = readFileSync(join(__dirname, `../../public/views/login/_login_${req.params.language}.html`)).toString('utf8')
    template = readFileSync(join(__dirname, `../../public/views/login/login_geolytix.html`)).toString('utf8')

  } catch {

    // Read and assign the English login view as fallback.
    template = readFileSync(join(__dirname, `../../public/views/login/_login_en.html`)).toString('utf8')
  }

  // The redirect for a successful login.
  const redirect = req.body && req.body.redirect ||
    req.url && decodeURIComponent(req.url).replace(/login\=true/, '')

  const params = {
    dir: process.env.DIR,
    redirect: redirect,
    msg: message || ' '
  }

  // Render the login template with params.
  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  // The login view will set the cookie to null.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  res.send(html)
}

async function post(req, res) {

  if(!req.body.email) return new Error(msg('missing_email', req.params.language))
  
  if(!req.body.password) return new Error(msg('missing_password', req.params.language))

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

  if (rows instanceof Error) return new Error(msg('failed_query', req.params.language))

  // Get user record from first row.
  const user = rows[0]

  if (!user) return new Error(msg('auth_failed', req.params.language))

  // Blocked user cannot login.
  if (user.blocked) return new Error(msg('user_blocked', user.language || req.params.language))
  
  // Get approvalDate for checking expiry.
  const approvalDate = user.approved_by && new Date(user.approved_by.replace(/.*\|/,''))

  // Non admin accounts may expire.
  if (!user.admin 
    && process.env.APPROVAL_EXPIRY && approvalDate
    && approvalDate.setDate(approvalDate.getDate() + parseInt(process.env.APPROVAL_EXPIRY || 0)) < date) {

    if (user.approved) {

      // Remove approval of expired user account.
      var rows = await acl(`
        UPDATE acl_schema.acl_table
        SET approved = false
        WHERE lower(email) = lower($1);`,
        [req.body.email])

      if (rows instanceof Error) return new Error(msg('failed_query', req.params.language))
    }

    return new Error(msg('user_expired', user.language))
  }

  // Accounts must be verified and approved for login
  if (!user.verified || !user.approved) {

    const mail_template = mail('failed_login', user.language)

    await mailer(Object.assign({
      to: user.email
    },
    mail_template({
      host: host,
      protocol: protocol,
      verified: user.verified,
      approved: user.approved,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })));

    return new Error(msg('user_not_verified', user.language))
  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(req.body.password, user.password)) {

    // Override the user language role with the login form language
    user.roles.push(req.body.language || user.language)

    if (process.env.NANO_SESSION) {

      const nano_session = nanoid()

      user.session = nano_session

      var rows = await acl(`
      UPDATE acl_schema.acl_table
      SET session = '${nano_session}'
      WHERE lower(email) = lower($1)`,
      [req.body.email])
  
      if (rows instanceof Error) return new Error(msg('failed_query', req.params.language))

    }

    return user
  }

  // FAILED LOGIN
  // Password from login form does NOT match encrypted password in ACL!

  // Increase failed login attempts counter by 1.
  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET failedattempts = failedattempts + 1
    WHERE lower(email) = lower($1)
    RETURNING failedattempts;`, [req.body.email])

  if (rows instanceof Error) return new Error(msg('failed_query', req.params.language))

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

    if (rows instanceof Error) return new Error(msg('failed_query', req.params.language))

    const mail_template = mail('locked_account', user.language)

    await mailer(Object.assign({
      to: user.email
    },
    mail_template({
      host: host,
      failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,
      protocol: protocol,
      verificationtoken: verificationtoken,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })));

    return new Error(msg('locked_account', user.language))
  }

  // Login has failed but account is not locked (yet).
  const mail_template = mail('login_incorrect', user.language)

  await mailer(Object.assign({
      to: user.email
    },
    mail_template({
      host: host,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })))

  return new Error(msg('auth_failed', req.params.language))
}