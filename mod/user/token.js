const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

const messages = require('./messages')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const jwt = require('jsonwebtoken')

const acl = require('./acl')()

module.exports = async (req) => {

  if(!req.body.email) return jwt.sign({
    msg: messages.missing_email[req.body.language || req.params.language || 'en'] || `Missing email`
  },
  process.env.SECRET, {
    expiresIn: '3s'
  })
  
  if(!req.body.password) return jwt.sign({
    msg: messages.missing_password[req.body.language || req.params.language || 'en'] || `Missing password`
  },
  process.env.SECRET, {
    expiresIn: '3s'
  })

  const date = new Date()

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/,'')}@${req.headers['x-forwarded-for'] || 'localhost'}')
    WHERE lower(email) = lower($1)
    RETURNING *;`, [req.body.email])

  if (rows instanceof Error) new Error('Bad Config')

  // Get user record from first row.
  const user = rows[0]

  // Redirect back to login (get) with error msg if user is not found.
  if (!user) return jwt.sign({
      msg: messages.user_not_found[req.body.language || req.params.language || 'en'] || `User not found.`
    },
    process.env.SECRET, {
      expiresIn: '3s'
    })

  if(user.blocked) return jwt.sign({
    msg: messages.user_blocked[req.body.language || req.params.language || 'en'] || `User blocked`
  },
  process.env.SECRET, {
    expiresIn: '3s'
  })
  
  const approvalDate = user.approved_by && new Date(user.approved_by.replace(/.*\|/,''))

  if (process.env.APPROVAL_EXPIRY && approvalDate && approvalDate.setDate(approvalDate.getDate() + parseInt(process.env.APPROVAL_EXPIRY || 0)) < date) {

    // Account approval date + APPROVAL_EXPIRY exceeds current date.
    if (!user.admin_user) {

      // Non user admin user will loose approval
      if (user.approved) {

        var rows = await acl(`
          UPDATE acl_schema.acl_table
          SET approved = false
          WHERE lower(email) = lower($1);`,
          [req.body.email])
      
        if (rows instanceof Error) return new Error('Bad Config')

      }

      return jwt.sign({
        msg: messages.user_expired[req.body.language || req.params.language || 'en'] || `User approval has expired. Please re-register.`
      },
      process.env.SECRET, {
        expiresIn: '3s'
      })
      
    }

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

    return jwt.sign({
      msg: messages.user_not_verified[req.body.language || req.params.language || 'en'] || `User not verified or approved`
    },
    process.env.SECRET, {
      expiresIn: '3s'
    })

  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(req.body.password, user.password)) {

    user.roles.push(user.language)

    // Create token with 8 hour expiry.
    const token = {
      email: user.email,
      admin_user: user.admin_user,
      admin_workspace: user.admin_workspace,
      language: user.language,
      key: user.api,
      roles: user.roles
    }

    token.signed = jwt.sign(
      token,
      process.env.SECRET,
      {
        expiresIn: '8h'
      })

    return token
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

    return jwt.sign({
      msg: messages.account_blocked[req.body.language || req.params.language || 'en'] || `Account is blocked, please check email.`
    },
    process.env.SECRET, {
      expiresIn: '3s'
    })

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

  return jwt.sign({
    msg: messages.token_failed[req.body.language|| req.params.language || 'en'] || `Failed to create token`
  },
  process.env.SECRET, {
    expiresIn: '3s'
  })

}