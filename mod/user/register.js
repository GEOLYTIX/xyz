const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const acl = require('./acl')()

const mailer = require('../utils/mailer')

const languageTemplates = require('../utils/languageTemplates')

const view = require('../view')

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send('ACL unavailable.')

  // Post request to register new user.
  if (req.body && req.body.register) return post(req, res)

  req.params.template = req.params.reset? 'password_reset_view': 'register_view';

  // The login view will set the cookie to null.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  // Get request for registration form view.
  view(req, res)
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

  const failed_query = await languageTemplates('failed_query', req.params.language)

  if (rows instanceof Error) return res.status(500).send(failed_query)

  const user = rows[0]

  // Setting the password to NULL will disable access to the account and prevent resetting the password.
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
    if (user.blocked) return res.status(500).send(await languageTemplates('user_blocked', user.language || req.params.language)) 

    // Set new password and verification token.
    // New passwords will only apply after account verification.
    var rows = await acl(`
      UPDATE acl_schema.acl_table SET
        ${process.env.APPROVAL_EXPIRY && user.expires_on ? `expires_on = ${parseInt((new Date().getTime() + process.env.APPROVAL_EXPIRY * 1000 * 60 * 60 * 24)/1000)},` : ''}
        password_reset = '${password}',
        verificationtoken = '${verificationtoken}',
        access_log = array_append(access_log, '${date}@${remote_address}')
      WHERE lower(email) = lower($1);`,
      [req.body.email])

    if (rows instanceof Error) return res.status(500).send(await languageTemplates('failed_query', req.params.language))

    // Sent mail with verification token to the account email address.  
    await mailer({
      template: 'verify_password_reset',
      language: user.language,
      to: user.email,
      host: host,
      link: `${protocol}${host}/api/user/verify/${verificationtoken}`,
      remote_address
    })
    
    const password_reset_verification = await languageTemplates('password_reset_verification', user.language)

    return res.send(password_reset_verification)
  }

  const language = Intl.Collator.supportedLocalesOf([req.body.language], { localeMatcher: 'lookup' })[0] || 'en';
  
  // Create new user account
  var rows = await acl(`
    INSERT INTO acl_schema.acl_table (
      email,
      password,
      language,
      ${process.env.APPROVAL_EXPIRY ? 'expires_on,' : ''}
      verificationtoken,
      access_log )

    SELECT
      '${req.body.email}' AS email,
      '${password}' AS password,
      '${language}' AS language,
      ${process.env.APPROVAL_EXPIRY ? `${parseInt((new Date().getTime() + process.env.APPROVAL_EXPIRY * 1000 * 60 * 60 * 24)/1000)} AS expires_on,` : ''}
      '${verificationtoken}' AS verificationtoken,
      array['${date}@${req.ips && req.ips.pop() || req.ip}'] AS access_log;`)

  if (rows instanceof Error) return res.status(500).send(await languageTemplates('failed_query', req.params.language))

  await mailer({
    template: 'verify_account',
    language,
    to: req.body.email,
    host: host,
    link: `${protocol}${host}/api/user/verify/${verificationtoken}`,
    remote_address
  })

  // Return msg. No redirect for password reset.
  res.send(await languageTemplates('new_account_registered', language))
}