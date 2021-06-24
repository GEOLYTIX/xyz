const fetch = require('node-fetch')

module.exports = async (req, res) => {

  if (req.url.match(/\/auth0\/logout/)) {

    res.setHeader('location',
      `https://geolytix-saml.eu.auth0.com/v2/logout`
      + `?client_id=${process.env.AUTH_CLIENTID}`
      + `&federated=https://auth.pingone.eu/dd912efb-f9b0-4fa5-9c9c-68c317910396/saml20/idp/slo`
      + `&returnTo=http://localhost:3000/`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/login/)) {

    res.setHeader('location',
      `https://geolytix-saml.eu.auth0.com/authorize`
      + `?response_type=code`
      + `&client_id=${process.env.AUTH_CLIENTID}`
      + `&scope=openid profile email`
      + `&connection=geolytix-saml-connection`
      + `&redirect_uri=http://localhost:3000/auth0/callback`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/callback/)) {

    const body = Object.entries({
        grant_type: 'authorization_code',
        audience: 'https://geolytix-saml.eu.auth0.com/api/v2/',
        client_id: process.env.AUTH_CLIENTID,
        client_secret: process.env.AUTH_SECRET,
        code: req.query.code,
        redirect_uri: 'http://localhost:3000/auth0/callback'
      })
      .map(entry => `${encodeURIComponent(entry[0])}=${encodeURIComponent(entry[1])}`)
      .join('&')

    const oauth_response = await fetch(`https://geolytix-saml.eu.auth0.com/oauth/token`,{
      method: 'post',
      body:    body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  
    const oauth_json = await oauth_response.json()

    //console.log(oauth_json)

    //return res.send(oauth_json)
 
    const userinfo_response = await fetch(
      `https://geolytix-saml.eu.auth0.com/userinfo`, {
        method: 'get',
        headers: {
          authorization: `Bearer ${oauth_json.access_token}`
        }
      })
  
    const userinfo_json = await userinfo_response.json()
  
    res.send(userinfo_json)
  }

}