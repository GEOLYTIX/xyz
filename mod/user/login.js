const acl = require('./acl')()

const {
  readFileSync
} = require('fs')

const {
  join
} = require('path')

const getToken = require('./token')

module.exports = async (req, res, msg) => {

  if (!acl) return res.send('No Access Control List.')

  if (req.body && req.body.login) {

    const token = await getToken(req)

    if (token instanceof Error) return view(req, res, token.message)

    const cookie = `${process.env.TITLE}=${token.signed || token};HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

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