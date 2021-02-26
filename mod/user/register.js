const { readFileSync } = require('fs')

const { join } = require('path')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const acl = require('./acl')()

const mailer = require('../mailer')

const mails = require('./mails')

const mail = (m, lang) => mails[m] && (mails[m][lang] || mails[m].en)

const messages = require('./messages')

const msg = (m, lang) => messages[m] && (messages[m][lang] || messages[m].en) || m

module.exports = async (req, res) => {

  if (!acl) return res.status(500).send(msg('acl_unavailable', req.params.language))

  // Post request to register new user.
  if (req.body && req.body.register) return post(req, res)

  // Get request for registration form view.
  view(req, res)
}

function view(req, res) {

  let template

  // The template should be read inside the view handler.
  try {

    // Attempt to read a language spcific registration view template.
    template = readFileSync(join(__dirname, `../../public/views/register/_register_${req.params.language}.html`)).toString('utf8')

  } catch {

    // Read and assign the English registration view as fallback.
    template = readFileSync(join(__dirname, `../../public/views/register/_register_en.html`)).toString('utf8')
  }

  const params = {
    dir: process.env.DIR
  }

  // Render the login template with params.
  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  // The login view will set the cookie to null.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  res.send(html)
}

async function post(req, res) {

  // Test whether the provided email is valid.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) return res.status(403).send('Invalid email provided')

  // Test whether a password has been provided.
  if (!req.body.password) return res.status(400).send('No password provided')

  // Test whether the provided password is valid.
  if (!/(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{10,}$/.test(req.body.password)) return res.status(403).send('Invalid password provided')

  // Attempt to retrieve ACL record with matching email field.
  var rows = await acl(`
    SELECT email, language, blocked
    FROM acl_schema.acl_table 
    WHERE lower(email) = lower($1);`,
    [req.body.email])

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  const user = rows[0]

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
    if (user.blocked) return res.status(500).send(msg('user_blocked', user.language || req.params.language)) 

    // Set new password and verification token.
    // New passwords will only apply after account verification.
    var rows = await acl(`
      UPDATE acl_schema.acl_table SET
        password_reset = '${password}',
        verificationtoken = '${verificationtoken}',
        access_log = array_append(access_log, '${date}@${req.headers['x-forwarded-for'] || 'localhost'}')
      WHERE lower(email) = lower($1);`,
      [req.body.email])

    if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

    // Sent mail with verification token to the account email address.
    const mail_template = mail('verify_password_reset', user.language)
    
    await mailer(Object.assign({
        to: user.email
      },
      mail_template({
        host: host,
        protocol: protocol,
        verificationtoken: verificationtoken,
        address: req.headers['x-forwarded-for'] || 'localhost',
      })))
    
    // Return msg. No redirect for password reset.
    return res.send(msg('password_reset_verification', user.language))
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

  if (rows instanceof Error) return res.status(500).send(msg('failed_query', req.params.language))

  // Sent mail with verification token to the account email address.
  const mail_template = mail('verify_account', req.body.language)

  await mailer(Object.assign({
      to: req.body.email
    },
    mail_template({
      host: host,
      protocol: protocol,
      verificationtoken: verificationtoken,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })))

  // Return msg. No redirect for password reset.
  res.send(msg('new_account_registered', req.body.language))

}