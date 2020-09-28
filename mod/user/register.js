const { readFileSync } = require('fs')

const { join } = require('path')

const templates = {
  en: readFileSync(join(__dirname, '../../public/views/_register.html')).toString('utf8'),
  de: readFileSync(join(__dirname, '../../public/views/_register_de.html')).toString('utf8'),
  fr: readFileSync(join(__dirname, '../../public/views/_register_fr.html')).toString('utf8'),
  pl: readFileSync(join(__dirname, '../../public/views/_register_pl.html')).toString('utf8'),
  ja: readFileSync(join(__dirname, '../../public/views/_register_ja.html')).toString('utf8'),
  ko: readFileSync(join(__dirname, '../../public/views/_register_ko.html')).toString('utf8'),
  zh: readFileSync(join(__dirname, '../../public/views/_register_zh.html')).toString('utf8')
}

const bcrypt = require('bcryptjs')

const crypto = require('crypto')

const acl = require('./acl')()

const mailer = require('../mailer')

const mail_templates = require('../mail_templates')

const messages = require('./messages')

module.exports = async (req, res) => {

  if (!acl) return res.send('No Access Control List.')

  const template = req.params.language && templates[req.params.language] || templates.en

  if (req.body) return register(req, res)

  const params = {
    language: req.params.language || 'en',
    dir: process.env.DIR || '',
    captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[0] || '',
  }

  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  res.send(html)
}

async function register(req, res) {

  if (process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[1]) {

    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA.split('|')[1]}&response=${req.body.captcha}`)

    const captcha_verification = await response.json()
    
    if (captcha_verification.score < 0.6) return res.status(500).send('Captcha failed.')

  }

  const acl_schema = await acl(`SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'acl_table';`)

  var rows = await acl(`SELECT * FROM acl_schema.acl_table WHERE lower(email) = lower($1);`, [req.body.email])

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const user = rows[0]

  const password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8))

  const verificationtoken = crypto.randomBytes(20).toString('hex')

  const date = new Date().toISOString().replace(/\..*/,'')

  const protocol = `${req.headers.host.includes('localhost') && 'http' || 'https'}://`

  const host = `${req.headers.host.includes('localhost') && req.headers.host || process.env.ALIAS || req.headers.host}${process.env.DIR || ''}`

  if (user) {

    if (user.blocked) return res.status(500).send(messages.user_blocked[user.language || req.params.language || 'en'] || 
      `User blocked`)

    // Reset password.
    rows = await acl(`
    UPDATE acl_schema.acl_table SET
      password_reset = '${password}',
      verificationtoken = '${verificationtoken}',
      access_log = array_append(access_log, '${date}@${req.headers['x-forwarded-for'] || 'localhost'}')
    WHERE lower(email) = lower($1);`, [req.body.email])

    if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

    const verification_mail = mail_templates.verify_password_reset[req.body.language || 'en'] || mail_templates.verify_password_reset.en;
    
    await mailer(Object.assign({
        to: user.email
      },
      verification_mail({
        host: host,
        protocol: protocol,
        verificationtoken: verificationtoken,
        address: req.headers['x-forwarded-for'] || 'localhost',
      })))
    
    return res.send(messages.password_reset_verification[req.body.language || req.params.language || 'en'] || 
      `Password will be reset after email verification.`)
  }
  
  // Create new user account
  var rows = await acl(`
  INSERT INTO acl_schema.acl_table (email, password, ${acl_schema.some(col => col.column_name === 'language') && 'language,' || ''} verificationtoken, access_log)
  SELECT
    '${req.body.email}' AS email,
    '${password}' AS password,
    ${acl_schema.some(col => col.column_name === 'language') && `'${req.body.language}' AS language,` || ''}
    '${verificationtoken}' AS verificationtoken,
    array['${date}@${req.ips && req.ips.pop() || req.ip}'] AS access_log;`)

  if (rows instanceof Error) return res.status(500).send('Failed to query PostGIS table.')

  const verify_account_mail = mail_templates.verify_account[req.body.language || req.params.language || 'en'] || mail_templates.verify_account.en;

  await mailer(Object.assign({
    to: req.body.email
  },
  verify_account_mail({
    host: host,
    protocol: protocol,
    verificationtoken: verificationtoken,
    remote_address: `${req.headers['x-forwarded-for'] || 'localhost'}`
  })));

  return res.send(messages.new_account_registered[req.body.language || req.params.language || 'en'] ||
    `A new account has been registered and is awaiting email verification.`)

}