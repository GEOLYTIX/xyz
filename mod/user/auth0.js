const fetch = require('node-fetch')

module.exports = async (req, res) => {

  if (req.url.match(/\/auth0\/logout/)) {

    res.setHeader('location', `https://geolytix-idp.eu.auth0.com/v2/logout?client_id=${process.env.AUTH_CLIENTID}&returnTo=https://xyz-asda-saml.vercel.app/asda/auth0/login`)

    return res.status(302).send()
    
  }

  if (req.url.match(/\/auth0\/login/)) {

    res.setHeader('location', `https://geolytix-idp.eu.auth0.com/authorize?response_type=code&client_id=${process.env.AUTH_CLIENTID}&scope=openid profile email&redirect_uri=https://xyz-asda-saml.vercel.app/asda/auth0/callback`)

    return res.status(302).send()
    
  }

  if (req.url.match(/\/auth0\/callback/)) {

    if (!req.query.code) return res.send('no query code')

    const form = {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH_CLIENTID,
      client_secret: process.env.AUTH_SECRET,
      code: req.query.code,
      redirect_uri: 'https://xyz-asda-saml.vercel.app/asda/auth0/callback'
    }
  
    const formBody = [];
    for (var property in form) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(form[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
  
    const oauth_response = await fetch(`https://geolytix-idp.eu.auth0.com/oauth/token`,{
      method: 'post',
      body:    formBody.join('&'),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  
    const oauth_json = await oauth_response.json()
 
    const userinfo_response = await fetch(
      `https://geolytix-idp.eu.auth0.com/userinfo`,{
      method: 'get',
      headers: {authorization: `Bearer ${oauth_json.access_token}`}
    })
  
    const userinfo_json = await userinfo_response.json()
  
    res.send(userinfo_json)
  }

}