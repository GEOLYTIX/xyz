const fetch = require('node-fetch')

const request = require("request")

module.exports = async (req, res) => {

  if (req.url.match(/\/auth0\/logout/)) {

    res.setHeader('location', `https://geolytix-saml.eu.auth0.com/v2/logout?client_id=${process.env.AUTH_CLIENTID}&returnTo=http://localhost:3000/auth0/login`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/login/)) {

    res.setHeader('location', `https://geolytix-saml.eu.auth0.com/authorize?response_type=code&client_id=${process.env.AUTH_CLIENTID}&scope=openid profile email&redirect_uri=http://localhost:3000/auth0/callback`)

    return res.status(302).send()
  }

  if (req.url.match(/\/auth0\/callback/)) {

    // request({
    //     method: 'POST',
    //     url: 'https://geolytix-saml.eu.auth0.com/oauth/token',
    //     headers: {
    //       'content-type': 'application/json'
    //     },
    //     body: '{"client_id":"***","client_secret":"***-_zfW","audience":"https://geolytix-saml.eu.auth0.com/api/v2/","grant_type":"client_credentials"}'
    //   },
    //   function (error, response, body) {
    //     if (error) throw new Error(error);

    //     console.log(body);
    //   })

    const form = {
      grant_type: 'authorization_code',
      audience: 'https://geolytix-saml.eu.auth0.com/api/v2/',
      client_id: process.env.AUTH_CLIENTID,
      client_secret: process.env.AUTH_SECRET,
      code: req.query.code,
      redirect_uri: 'http://localhost:3000/auth0/callback'
    }
  
    const formBody = [];
    for (var property in form) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(form[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
  
    const oauth_response = await fetch(`https://geolytix-saml.eu.auth0.com/oauth/token`,{
      method: 'post',
      body:    formBody.join('&'),
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