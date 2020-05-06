const transformDate = require('../date')

const mailer = require('../mailer')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const jwt = require('jsonwebtoken')

const acl = require('./acl')()

module.exports = async (req) => {

  if (!req.body.email) return new Error('Missing email')

  if (!req.body.password) return new Error('Missing password')

  const date = transformDate()

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  var rows = await acl(`
  UPDATE acl_schema.acl_table
  SET access_log = array_append(access_log, '${date}@${req.headers['X-Forwarded-For'] || 'localhost'}')
  WHERE lower(email) = lower($1)
  RETURNING *;`, [req.body.email])

  if (rows instanceof Error) return new Error('Bad Config')

  // Get user record from first row.
  const user = rows[0]

  if (user && user.blocked) return new Error('User blocked')

  // Redirect back to login (get) with error msg if user is not found.
  if (!user) return new Error('No user')

  // Redirect back to login (get) with error msg if user is not valid.
  if (!user.verified || !user.approved) {

    // Sent fail mail when to account email if login failed.
    await mailer({
      to: user.email,
      subject: `A failed login attempt was made on ${host}`,
      text: `${user.verified ? 'The account has been verified.' : 'The account has NOT been verified.'}
      ${user.approved ? 'The account has been approved.' : 'Please wait for account approval confirmation email.'}
      The failed attempt occured from this remote address ${req.headers['X-Forwarded-For'] || 'localhost'}
      This wasn't you? Please let your manager know.`
    })

    return new Error('User not verified or approved')
  }

  // Check password from post body against encrypted password from ACL.
  if (bcrypt.compareSync(req.body.password, user.password)) {

    // Create token with 8 hour expiry.
    const token = {
      email: user.email,
      admin_user: user.admin_user,
      admin_workspace: user.admin_workspace,
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

    await mailer({
      to: user.email,
      subject: `Too many failed login attempts occured on ${host}`,
      text: `${parseInt(process.env.FAILED_ATTEMPTS) || 3} failed login attempts have been recorded on this account.
      This account has now been locked until verified.
      Please verify that you are the account holder: ${protocol}${host}/api/user/verify/${verificationtoken}
      Verifying the account will reset the failed login attempts.
      The failed attempt occured from this remote address ${req.headers['X-Forwarded-For'] || 'localhost'}
      This wasn't you? Please let your manager know.`
    })

    return new Error('Account is blocked, please check email.')
  }

  // Finally login has failed.
  await mailer({
    to: user.email,
    subject: `A failed login attempt was made on ${host}`,
    text: `An incorrect password was entered!
    The failed attempt occured from this remote address ${req.headers['X-Forwarded-For'] || 'localhost'}
    This wasn't you? Please let your manager know.`
  })

  return new Error('Failed to create token')

}