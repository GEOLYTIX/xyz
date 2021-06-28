const fetch = require('node-fetch')

const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {

  if (req.url.match(/\/auth0\/logout/)) {

    res.setHeader('location',
      `https://${process.env.AUTH0_DOMAIN}/v2/logout`
      + `?client_id=${process.env.AUTH0_CLIENTID}`
      + `&federated=${process.env.AUTH0_SLO}`
      + `&returnTo=${process.env.AUTH0_HOST}/${process.env.DIR}`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/login/)) {

    res.setHeader('location',
      `https://${process.env.AUTH0_DOMAIN}/authorize`
      + `?response_type=code`
      + `&client_id=${process.env.AUTH0_CLIENTID}`
      + `&scope=openid email`
      + `&connection=geolytix-saml-connection`
      + `&redirect_uri=${process.env.AUTH0_HOST}/${process.env.DIR}auth0/callback`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/callback/)) {

    const body = Object.entries({
        grant_type: 'authorization_code',
        audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
        client_id: process.env.AUTH0_CLIENTID,
        client_secret: process.env.AUTH0_SECRET,
        code: req.query.code,
        redirect_uri: `${process.env.AUTH0_HOST}/${process.env.DIR}auth0/callback`
      })
      .map(entry => `${encodeURIComponent(entry[0])}=${encodeURIComponent(entry[1])}`)
      .join('&')

    const oauth_response = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`,{
      method: 'post',
      body:    body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  
    const oauth_json = await oauth_response.json()
 
    const userinfo_response = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/userinfo`, {
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

    const cookie = `${process.env.TITLE}=${token};HttpOnly;`
      + `Max-Age=${process.env.COOKIE_TTL};`
      + `Path=${process.env.DIR || '/'}`
      + `${!req.headers.host.includes('localhost') && ';Secure' || ''}`

    res.setHeader('Set-Cookie', cookie)

    res.setHeader('location', `${process.env.AUTH0_HOST}/${process.env.DIR}`)
    res.status(302).send()

  }

}