const fetch = require('node-fetch')

const _token = require('./token')

const login = require('../user/login')

module.exports = async (req, res) => {

  if (process.env.GOOGLE_CAPTCHA) {

    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_CAPTCHA.split('|')[1]}&response=${req.body.captcha}`)

    const captcha_verification = await response.json()

    if (captcha_verification.score < 0.6) return new Error('Captcha Fail')
  } 

  if (!req.body) {

    if (req.cookies && req.cookies[`XYZ ${process.env.COOKIE || process.env.TITLE || 'token'}`]) {

      return res.send(`XYZ ${process.env.COOKIE || process.env.TITLE || 'token'}=<a href="${process.env.DIR || '/'}api/user/token">token</a>;HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`)

    }

    return login(req, res)

  }

  const token = await _token(req)

  if (token instanceof Error) return login(req, res, token.message)

  const cookie = `XYZ ${process.env.COOKIE || process.env.TITLE || 'token'}=${token.signed};HttpOnly;Max-Age=28800;Path=${process.env.DIR || '/'};SameSite=Strict${!req.headers.host.includes('localhost') && ';Secure' || ''}`

  res.setHeader('Set-Cookie', cookie)

  res.setHeader('location', `${req.body.redirect}`)

  res.status(302).send()
}