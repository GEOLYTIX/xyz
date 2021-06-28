---
title: SSO (SAML)
layout: root.html
---

# Single Sign On via SAML

The SAML standard allows the XYZ host to provide authorization to user account authenticated by a third party identity provider.

Single sign on (SSO) requests must be initiated by the service provider. The [auth0 module](https://github.com/GEOLYTIX/xyz/blob/development/mod/user/auth.js) provides endpoints to initiate sign on, authorization, and log out via Auth0 as service provider.

## /auth0/login

The auth0/login endpoint will redirect the http response object to an **/authorize** endpoint of an Auth0 Service Provider. The callback URI must be defined as redirect parameter in the authorization request. The authorization code which is requested as response_type will be send to the callback endpoint.

The AUTH0_DOMAIN and AUTH0_CLIENTID must be provided to the XYZ process environment.

The AUTH0_HOST environment value (e.g. http://localhost:3000) allows the process to be run on localhost without https to test the authentication flow.

```
res.setHeader('location',
  `https://${process.env.AUTH0_DOMAIN}/authorize`
  + `?response_type=code`
  + `&client_id=${process.env.AUTH0_CLIENTID}`
  + `&scope=openid email`
  + `&connection=geolytix-saml-connection`
  + `&redirect_uri=${process.env.AUTH0_HOST}/${process.env.DIR}auth0/callback`)

res.status(302).send()
```

## Auth0 Service Provider

A *regular web application* configured via the Auth0 dashboard may act as Service Provider for the XYZ Host.

The AUTH0_CLIENTID and AUTH0_DOMAIN required for the XYZ process environment are defined in the settings for the Auth0 service provider application.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624878641/documentation/auth0_sp_application_settings_v0wzuy.png)

The application URIs must be configured in the application settings panel. The login URI is not required as this is for SSO initiated sign on only. The allowed callback and logout URI must be set. We recommend to add the localhost URL as well as any aliased URL if required to the comma seperated list of URL. The logout URL is the root path for the XYZ host. This is the URL to which the request is redirected on conclusion of the logout.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624879546/documentation/auth0_allowed_url_fokbb5.png)

The SAML Enterprise connection to be used must be authorised in the applications connection panel.

The Auth0 Application itself must be authorized for machine to machine access in the Auth0 Management API panel.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624878474/documentation/auth0_management_api_vkni4i.png)


The required *SAML enterprise connection* is not available on a free plan and requires the Auth0 tenant to be subscribed on a B2B Essentials plan.

The SSO sign in URL (e.g. https://auth.pingone.eu/dd912efb-f9b0-4fa5-9c9c-68c317910396/saml20/idp/sso), and SLO (logout; e.g. https://auth.pingone.eu/dd912efb-f9b0-4fa5-9c9c-68c317910396/saml20/idp/slo) must be set in the SAML connection settings. The X509 signing certificate from the identity provider must be uploaded to be used by the SAML connection.

We recommend to enable to the debug mode for the SAML connection to allow for more verbose logging during the authentication process. We also recommend to sign requests with the SHA256 algorithm digest.

An Auth0 pipeline rule must be configured and enabled to map XYZ user attributes (e.g. roles) with their namespace from the identity provider token for the account profile to be used in the XYZ token.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624880795/documentation/auth0_pipeline_rule_stogak.png)

Finally, the Auth0 application which is used as service provider must be authorized in the applications panel of the SAML connection.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624878474/documentation/auth0_management_api_vkni4i.png)


## /auth0/callback

The auth0 callback endpoint is a series of requests between the XYZ host and the Auth0 application with its respective SAML connection.

Callback requests which are received from the authorization redirect must carry an authorization code. The code from the http request object query is provided in the body to the oauth/token API request.

```
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

//access_token:'afE...'
//expires_in:86400
//id_token:'eyJ...'
//scope:'openid email'
//token_type:'Bearer'
```

The parsed oauth JSON token contains an id_token which can be used authorization header to request the userinfo.

```
const userinfo_response = await fetch(
  `https://${process.env.AUTH0_DOMAIN}/userinfo`, {
    method: 'get',
    headers: {
      authorization: `Bearer ${oauth_json.access_token}`
    }
  })
  
const userinfo_json = await userinfo_response.json()
```

Finally the userinfo from the userinfo response is used to sign an XYZ token to be set as an application cookie when the request is redirected to the application root path.

```
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
```

## PingOne Identity Provider

PingOne provides an Identity Provider for SSO as a cloud service. If linked to a user directory this service is comparable to a Ping Federate server.

The PingOne identity provider application may be configured from the Auth0 service provider metadata.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624883488/documentation/pingone_sp_conf_pzhvbk.png)

Additional user attribute mapping is required to provide roles for the XYZ user token.

![](https://res.cloudinary.com/geolytix-xyz/image/upload/v1624883685/documentation/pingone_saml_mapping_njmipt.png)

## /auth0/logout

The auth0 logout endpoint will redirect the http request to the auth0 logout endpoint. The auth0 service provider will destroy the session cookie and request from the federated identity provider to logout the user. The federated single logout URI must be defined as AUTH0_SLO in the XYZ process environment.

```
res.setHeader('location',
  `https://${process.env.AUTH0_DOMAIN}/v2/logout`
  + `?client_id=${process.env.AUTH0_CLIENTID}`
  + `&federated=${process.env.AUTH0_SLO}`
  + `&returnTo=${process.env.AUTH0_HOST}/${process.env.DIR}`)

res.status(302).send()
```