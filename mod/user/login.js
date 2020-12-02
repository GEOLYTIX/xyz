const acl = require('./acl')()

const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

const messages = require('./messages')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const jwt = require('jsonwebtoken')

const { readFileSync } = require('fs')

const { join } = require('path')

module.exports = async (req, res, msg) => {

  if (!acl) return res.send('No Access Control List.')

  if (req.body && req.body.login) {

    const user = await post(req)

    if (user instanceof Error) return view(req, res, user.message)

    // Create token with 8 hour expiry.
    const token = jwt.sign({
        email: user.email,
        admin: user.admin,
        language: req.body.language || user.language,
        roles: user.roles
      },
      process.env.SECRET, {
        expiresIn: '8h'
      })

    const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

    res.setHeader('Set-Cookie', cookie)

    res.setHeader('location', `${req.body.redirect}`)

    return res.status(302).send()

  }

  view(req, res, msg)

}

function view(req, res, msg) {

  let template

  try {

    template = readFileSync(join(__dirname, `../../public/views/login/_login_${req.params.language}.html`)).toString('utf8')

  } catch {

    template = readFileSync(join(__dirname, `../../public/views/login/_login_en.html`)).toString('utf8')

  }

  // The redirect for a successful login.
  const redirect = req.body && req.body.redirect ||
    req.url && decodeURIComponent(req.url).replace(/login\=true/, '')

  const params = {
    dir: process.env.DIR,
    redirect: redirect,
    language: req.params.language,
    msg: msg || ' '
  }

  // Render the login template with params.
  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  // The login view will set the cookie to null.
  res.setHeader('Set-Cookie', `${process.env.TITLE}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  res.send(html)

}

async function post(req, res) {

  if(!req.body.email) return new Error(messages.missing_email[req.body.language || req.params.language || 'en'] || 'Missing email')
  
  if(!req.body.password) return new Error(messages.missing_password[req.body.language || req.params.language || 'en'] || 'Missing password')

  const date = new Date()

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR}`

  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/,'')}@${req.headers['x-forwarded-for'] || 'localhost'}')
    WHERE lower(email) = lower($1)
    RETURNING *;`, [req.body.email])

  if (rows instanceof Error) return new Error('Bad Config')

  // Get user record from first row.
  const user = rows[0]

  // Redirect back to login (get) with error msg if user is not found.
  if (!user) return new Error(messages.user_not_found[req.body.language || req.params.language || 'en'] || 'User not found.')

  if (user.blocked) return new Error(messages.user_blocked[req.body.language || req.params.language || 'en'] || 'User blocked')
  
  const approvalDate = user.approved_by && new Date(user.approved_by.replace(/.*\|/,''))

  if (!user.admin && process.env.APPROVAL_EXPIRY && approvalDate && approvalDate.setDate(approvalDate.getDate() + parseInt(process.env.APPROVAL_EXPIRY || 0)) < date) {

    // Non user admin user will loose approval
    if (user.approved) {

      var rows = await acl(`
          UPDATE acl_schema.acl_table
          SET approved = false
          WHERE lower(email) = lower($1);`,
        [req.body.email])

      if (rows instanceof Error) return new Error('Bad Config')

    }

    return new Error(messages.user_expired[req.body.language || req.params.language || 'en'] || 'User approval has expired. Please re-register.')

  }

  // Redirect back to login (get) with error msg if user is not valid.
  if (!user.verified || !user.approved) {

    const failed_login_mail = mail_templates.failed_login[user.language || req.params.language || 'en'] || mail_templates.failed_login.en;

    await mailer(Object.assign({
      to: user.email
    },
    failed_login_mail({
      host: host,
      protocol: protocol,
      verified: user.verified,
      approved: user.approved,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })));

    return new Error(messages.user_not_verified[req.body.language || req.params.language || 'en'] || 'User not verified or approved')

  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(req.body.password, user.password)) {

    user.roles.push(req.body.language || user.language)

    return user
  }


  // Password from login form does NOT match encrypted password in ACL!
  // Increase failed login attempts counter by 1 for user in ACL.
  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET failedattempts = failedattempts + 1
    WHERE lower(email) = lower($1)
    RETURNING failedattempts;`, [req.body.email])

  if (rows instanceof Error) return new Error('Bad Config')

  // Check whether failed login attempts exceeds limit.
  if (rows[0].failedattempts >= parseInt(process.env.FAILED_ATTEMPTS || 3)) {

    // Create a new verification token and remove verified status in ACL.
    const verificationtoken = crypto.randomBytes(20).toString('hex')

    // Store new verification token in ACL.
    var rows = await acl(`
      UPDATE acl_schema.acl_table
      SET
        verified = false,
        verificationtoken = '${verificationtoken}'
      WHERE lower(email) = lower($1);`, [req.body.email])

    if (rows instanceof Error) return new Error('Bad Config')

    const locked_account_mail = mail_templates.locked_account[user.language || req.params.language || 'en'] || mail_templates.locked_account.en;

    await mailer(Object.assign({
      to: user.email
    },
    locked_account_mail({
      host: host,
      failed_attempts: parseInt(process.env.FAILED_ATTEMPTS) || 3,
      protocol: protocol,
      verificationtoken: verificationtoken,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })));

    return new Error(messages.account_blocked[req.body.language || req.params.language || 'en'] || 'Account is blocked, please check email.')

  }

  // Finally login has failed.
  const login_incorrect_mail = mail_templates.login_incorrect[user.language || req.params.language || 'en'] || mail_templates.login_incorrect.en;

  await mailer(Object.assign({
      to: user.email
    },
    login_incorrect_mail({
      host: host,
      remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
    })));

  return new Error(messages.token_failed[req.body.language|| req.params.language || 'en'] || 'Failed to create token')

}