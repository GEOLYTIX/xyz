const { readFileSync } = require('fs')

const { join } = require('path')

const template = readFileSync(join(__dirname, '../../public/views/_register.html')).toString('utf8')

const render = params => template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const transformDate = require('../date')

const acl = require('../auth/acl')()

const mailer = require('../mailer')

module.exports = async (req, res) => {

  if (!acl) return res.send('No Access Control List.')

  const rows = await acl(`select * from acl_schema.acl_table limit 1`)

  if (rows instanceof Error) return res.send('Failed to connect with Access Control List.')

  if (req.body) return register(req, res)

  const html = render({
    dir: process.env.DIR || '',
    captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[0] || '',
  })

  res.send(html)
}

async function register(req, res) {

  if (process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[1]) {

    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA.split('|')[1]}&response=${req.body.captcha}`)

    const captcha_verification = await response.json()
    
    if (captcha_verification.score < 0.6) return res.status(500).send('Captcha failed.')

  }

  var rows = await acl(`SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`, [req.body.email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))

  const verificationtoken = crypto.randomBytes(20).toString('hex')

  const date = transformDate()

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  if (user) {

    if (user.blocked) return res.status(500).send('User account is blocked.')

    // Reset password.
    rows = await acl(`
    UPDATE acl_schema.acl_table SET
      password_reset = '${password}',
      verificationtoken = '${verificationtoken}',
      access_log = array_append(access_log, '${date}@${req.headers['X-Forwarded-For'] || 'localhost'}')
    WHERE lower(email) = lower($1);`, [req.body.email])

    if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

    await mailer({
      to: user.email,
      subject: `Please verify your password reset for ${host}`,
      text: `A new password has been set for this account.
      Please verify that you are the account holder: ${protocol}${host}/api/user/verify/${verificationtoken}
      The reset occured from this remote address ${req.headers['X-Forwarded-For'] || 'localhost'}
      This wasn't you? Please let your manager know.`
    })

    return res.send('Password will be reset after email verification.')
  }

  // Create new user account
  var rows = await acl(`
  INSERT INTO acl_schema.acl_table (email, password, verificationtoken, access_log)
  SELECT
    '${req.body.email}' AS email,
    '${password}' AS password,
    '${verificationtoken}' AS verificationtoken,
    array['${date}@${req.ips && req.ips.pop() || req.ip}'] AS access_log;`)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  await mailer({
    to: req.body.email,
    subject: `Please verify your account on ${host}`,
    text: `A new account for this email address has been registered with ${host}
    Please verify that you are the account holder: ${protocol}${host}/api/user/verify/${verificationtoken}
    A site administrator must approve the account before you are able to login.
    You will be notified via email once an adimistrator has approved your account.
    The account was registered from this remote address ${req.headers['X-Forwarded-For'] || 'localhost'}\n
    This wasn't you? Do NOT verify the account and let your manager know.`
  })

  return res.send('A new account has been registered and is awaiting email verification.')

}