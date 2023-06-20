const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const acl = require('./acl')()

const mailer = require('../utils/mailer')

const templates = require('../templates/_templates')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  // Post request to register new user.
  if (req.body && req.body.register) return post(req, res)

  // Get request for registration form view.
  view(req, res)
}

async function view(req, res) {

  // Get password reset or account registration view from templates.
  const view = await templates(req.params.reset && 'password_reset_view' || 'register_view', req.params.language, {
    dir: process.env.DIR
  })

  // The login view will set the cookie to null.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  res.send(view)
}

async function post(req, res) {

  const remote_address = req.headers['x-forwarded-for']
    && /^[A-Za-z0-9.,_-\s]*$/.test(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'] : 'invalid'
    || 'unknown';

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
  if (!passwordRgx.test(req.body.password)) return res.status(403).send('Invalid password provided')

  // Attempt to retrieve ACL record with matching email field.
  var rows = await acl(`
    SELECT email, password, language, blocked
    FROM acl_schema.acl_table 
    WHERE lower(email) = lower($1);`,
    [req.body.email])

  if (rows instanceof Error) return res.status(500).send(await templates('failed_query', req.params.language))

  const user = rows[0]

  if (user?.password === null) {

    return res.status(401).send('User account has restricted access')
  }

  // Hash user the password from the body.
  const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))

  // Create random verification token.
  const verificationtoken = crypto.randomBytes(20).toString('hex')

  // Get the date for logs.
  const date = new Date().toISOString().replace(/\..*/,'')

  // Get the protocol and host for account verification email.
  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`
  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  // The password will be reset for exisiting user accounts.
  if (user) {

    // Blocked user may not reset their password.
    if (user.blocked) return res.status(500).send(await templates('user_blocked', user.language || req.params.language)) 

    // Set new password and verification token.
    // New passwords will only apply after account verification.
    var rows = await acl(`
      UPDATE acl_schema.acl_table SET
        password_reset = '${password}',
        verificationtoken = '${verificationtoken}',
        access_log = array_append(access_log, '${date}@${remote_address}')
      WHERE lower(email) = lower($1);`,
      [req.body.email])

    if (rows instanceof Error) return res.status(500).send(await templates('failed_query', req.params.language))

    // Sent mail with verification token to the account email address.
    var mail_template = await templates('verify_password_reset', user.language, {
      host: host,
      link: `${protocol}${host}/api/user/verify/${verificationtoken}`,
      remote_address
    })
    
    await mailer(Object.assign(mail_template, {
      to: user.email
    }))
    
    // Return msg. No redirect for password reset.
    return res.send(await templates('password_reset_verification', user.language))
  }
  
  // Create new user account
  var rows = await acl(`
    INSERT INTO acl_schema.acl_table (
      email,
      password,
      language,
      verificationtoken,
      access_log )

    SELECT
      '${req.body.email}' AS email,
      '${password}' AS password,
      '${req.body.language}' AS language,
      '${verificationtoken}' AS verificationtoken,
      array['${date}@${req.ips && req.ips.pop() || req.ip}'] AS access_log;`)

  if (rows instanceof Error) return res.status(500).send(await templates('failed_query', req.params.language))

  // Sent mail with verification token to the account email address.
  var mail_template = await templates('verify_account', req.body.language, {
    host: host,
    link: `${protocol}${host}/api/user/verify/${verificationtoken}`,
    remote_address
  })

  await mailer(Object.assign(mail_template, {
    to: req.body.email
  }))

  // Return msg. No redirect for password reset.
  res.send(await templates('new_account_registered', req.body.language))
}