const acl = require('./acl')()

const { readFileSync } = require('fs')

const { join } = require('path')

const templates = {
  en: readFileSync(join(__dirname, '../../public/views/_login.html')).toString('utf8'),
  de: readFileSync(join(__dirname, '../../public/views/_login_de.html')).toString('utf8'),
  fr: readFileSync(join(__dirname, '../../public/views/_login_fr.html')).toString('utf8'),
  pl: readFileSync(join(__dirname, '../../public/views/_login_pl.html')).toString('utf8'),
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
    language: req.params.language || 'en',
    msg: msg || ' '
  }

  const html = template.replace(/\$\{(.*?)\}/g, matched => params[matched.replace(/\$|\{|\}/g, '')] || '')

  res.setHeader('Set-Cookie', `XYZ ${process.env.TITLE || 'token'}=null;HttpOnly;Max-Age=0;Path=${process.env.DIR || '/'}`)

  res.send(html)
}