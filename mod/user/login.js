const acl = require('./acl')()

const { readFileSync } = require('fs')

const { join } = require('path')

const templates = {
  english: readFileSync(join(__dirname, '../../public/views/_login.html')).toString('utf8'),
  german: readFileSync(join(__dirname, '../../public/views/_login_german.html')).toString('utf8')
}

module.exports = async (req, res, msg) => {

  if (!acl) return res.send('No Access Control List.')

  const template = req.params.language && templates[req.params.language] || templates.english

  const params = {
    dir: process.env.DIR || '',
    redirect: req.body && req.body.redirect || req.url && decodeURIComponent(req.url),
    msg: msg || ' ',
    captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[0] || '',
  }

  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  res.send(html)
}