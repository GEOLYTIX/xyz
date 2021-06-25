const fetch = require('node-fetch')

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  if (req.url.match(/\/auth0\/logout/)) {

    res.setHeader('location',
      `https://geolytix-saml.eu.auth0.com/v2/logout`
      + `?client_id=${process.env.AUTH_CLIENTID}`
      + `&federated=https://auth.pingone.eu/dd912efb-f9b0-4fa5-9c9c-68c317910396/saml20/idp/slo`
      + `&returnTo=https://dev-auth0.vercel.app/`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/login/)) {

    res.setHeader('location',
      `https://geolytix-saml.eu.auth0.com/authorize`
      + `?response_type=code`
      + `&client_id=${process.env.AUTH_CLIENTID}`
      + `&scope=openid email username roles`
      + `&connection=geolytix-saml-connection`
      + `&redirect_uri=https://dev-auth0.vercel.app/auth0/callback`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/callback/)) {

    const body = Object.entries({
        grant_type: 'authorization_code',
        audience: 'https://geolytix-saml.eu.auth0.com/api/v2/',
        client_id: process.env.AUTH_CLIENTID,
        client_secret: process.env.AUTH_SECRET,
        code: req.query.code,
        redirect_uri: 'https://dev-auth0.vercel.app/auth0/callback'
      })
      .map(entry => `${encodeURIComponent(entry[0])}=${encodeURIComponent(entry[1])}`)
      .join('&')

    const oauth_response = await fetch(`https://geolytix-saml.eu.auth0.com/oauth/token`,{
      method: 'post',
      body:    body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  
    const oauth_json = await oauth_response.json()
 
    const userinfo_response = await fetch(
      `https://geolytix-saml.eu.auth0.com/userinfo`, {
        method: 'get',
        headers: {
          authorization: `Bearer ${oauth_json.access_token}`
        }
      })
  
    const userinfo_json = await userinfo_response.json()

    // Create token with 8 hour expiry.
    const token = jwt.sign({
        email: userinfo_json.email,
        language: userinfo_json.language || 'en',
        roles: userinfo_json['https://geolytix.xyz/roles'],
      },
      process.env.SECRET, {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

    const cookie = `${process.env.TITLE}=${token};HttpOnly;Max-Age=${process.env.COOKIE_TTL};Path=${process.env.DIR || '/'}${!req.headers.host.includes('localhost') && ';Secure' || ''}`

    res.setHeader('Set-Cookie', cookie)

    res.setHeader('location', `https://dev-auth0.vercel.app/`)
    res.status(302).send()

  }

}