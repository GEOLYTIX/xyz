const acl = require('./acl')()

const { readFileSync } = require('fs')

const { join } = require('path')

const templates = {
  en: readFileSync(join(__dirname, '../../public/views/login/_login_en.html')).toString('utf8'),
  de: readFileSync(join(__dirname, '../../public/views/login/_login_de.html')).toString('utf8'),
  fr: readFileSync(join(__dirname, '../../public/views/login/_login_fr.html')).toString('utf8'),
  pl: readFileSync(join(__dirname, '../../public/views/login/_login_pl.html')).toString('utf8'),
  ja: readFileSync(join(__dirname, '../../public/views/login/_login_ja.html')).toString('utf8'),
  ko: readFileSync(join(__dirname, '../../public/views/login/_login_ko.html')).toString('utf8'),
  zh: readFileSync(join(__dirname, '../../public/views/login/_login_zh.html')).toString('utf8')
}

module.exports = async (req, res, msg) => {

  if (!acl) return res.send('No Access Control List.')

  // Get the login template for language param or English if template doesn't exist
  const template = templates[req.params.language] || templates.en

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