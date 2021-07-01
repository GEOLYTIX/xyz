const saml2 = require('saml2-js')
const { join } = require('path')
const { readFileSync } = require('fs')

const jwt = require('jsonwebtoken')

const sp = new saml2.ServiceProvider({
  entity_id: process.env.SAML_ENTITY_ID,
  private_key: process.env.SAML_SP_CRT && String(readFileSync(join(__dirname, `../../${process.env.SAML_SP_CRT}.pem`))),
  certificate: process.env.SAML_SP_CRT && String(readFileSync(join(__dirname, `../../${process.env.SAML_SP_CRT}.crt`))),
  assert_endpoint: process.env.SAML_ACS,
  allow_unencrypted_assertion: true
})

const idp = new saml2.IdentityProvider({
  sso_login_url: process.env.SAML_SSO,
  sso_logout_url: process.env.SAML_SLO,
  certificates: process.env.SAML_IDP_CRT && [String(readFileSync(join(__dirname, `../../${process.env.SAML_IDP_CRT}.crt`)))],
  sign_get_request: true
})

module.exports = (req, res) => {

  if (req.url.match(/\/saml\/metadata/)) {

    res.setHeader('Content-Type', 'application/xml')
    res.send(sp.create_metadata())
  }

  if (req.url.match(/\/saml\/logout/)) {

    const cookie = req.cookies && req.cookies[process.env.TITLE]

    jwt.verify(
      cookie,
      process.env.SECRET,
      (err, user) => {
  
        if (err) return err
      
        sp.create_logout_request_url(idp, {
          name_id: user.name_id,
          session_index: user.session_index
        }, (err, logout_url) => {
          if (err != null) return res.send(500)


          res.setHeader('location', logout_url)
          res.status(301).send()
        })
  
      })

  }

  if (req.url.match(/\/saml\/login/)) {

    sp.create_login_request_url(idp, {}, (err, login_url, request_id) => {
      if (err != null) return res.send(500)

      res.setHeader('location', login_url)
      res.status(301).send()
    })
  }

  if (req.url.match(/\/saml\/acs/)) {

    sp.post_assert(idp, {
      request_body: req.body
    }, (err, saml_response) => {

      if (err != null) return res.send(500)
 
      // Create token with 8 hour expiry.
      const token = jwt.sign({
        email: saml_response.user.attributes.email && saml_response.user.attributes.email[0],
        language: 'en',
        roles: saml_response.user.attributes.roles && saml_response.user.attributes.roles[0],
        name_id: saml_response.user.name_id,
        session_index: saml_response.user.session_index,
      },
      process.env.SECRET, {
        expiresIn: parseInt(process.env.COOKIE_TTL)
      })

      const cookie = `${process.env.TITLE}=${token};HttpOnly;`
        + `Max-Age=${process.env.COOKIE_TTL};`
        + `Path=${process.env.DIR || '/'}`
        + `${!req.headers.host.includes('localhost') && ';Secure' || ''}`

      res.setHeader('Set-Cookie', cookie)

      // res.setHeader('location', `${process.env.AUTH0_HOST}/${process.env.DIR}`)
      // res.status(302).send()

      res.send(saml_response.user)
    })

  }

}