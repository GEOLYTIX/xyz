const acl = require('./acl')()

const { readFileSync } = require('fs')

const { join } = require('path')

const templates = {
  en: readFileSync(join(__dirname, '../../public/views/_login.html')).toString('utf8'),
  de: readFileSync(join(__dirname, '../../public/views/_login_de.html')).toString('utf8'),
  fr: readFileSync(join(__dirname, '../../public/views/_login_fr.html')).toString('utf8'),
  ja: readFileSync(join(__dirname, '../../public/views/_login_ja.html')).toString('utf8'),
  ko: readFileSync(join(__dirname, '../../public/views/_login_ko.html')).toString('utf8'),
  zh: readFileSync(join(__dirname, '../../public/views/_login_zh.html')).toString('utf8')
}

module.exports = async (req, res, msg) => {

  if (!acl) return res.send('No Access Control List.')

  const template = req.params.language && templates[req.params.language] || templates.en
  
  const params = {
    dir: process.env.DIR || '',
    redirect: req.body && req.body.redirect || req.url && decodeURIComponent(req.url),
    msg: msg || ' ',
    captcha: process.env.GOOGLE_CAPTCHA && process.env.GOOGLE_CAPTCHA.split('|')[0] || '',
  }

  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  res.send(html)
}