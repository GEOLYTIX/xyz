/**
## /user/saml

The SAML user module exports the saml method as an endpoint for request authentication via SAML.

The module requires the saml2-js module library to be installed. 

The availability of the module [required] is tried during the module initialisation.

If the module is not available, a warning is logged to the console.

The SAML Service Provider [sp] and Identity Provider [idp] are stored in module variables.

Succesful declaration of the sp and idp requires a Service Provider certificatate key pair `${process.env.SAML_SP_CRT}.pem` and `${process.env.SAML_SP_CRT}.crt` in the XYZ process root.

An Assertation Consumer Service [ACS] endpoint must be provided as `process.env.SAML_ACS`

The idp requires a certificate `${process.env.SAML_IDP_CRT}.crt`, single sign-on [SSO] login url `process.env.SAML_SSO` and logout url `process.env.SAML_SLO`.

@requires module:/utils/logger
@requires jsonwebtoken
@requires saml2-js

@module /user/saml
*/

let acl, sp, idp;

try {
  const saml2 = require('saml2-js');

  const logger = require('../utils/logger');

  const jwt = require('jsonwebtoken');

  const { join } = require('path');

  const { readFileSync } = require('fs');

  acl = require('./acl');

  sp = new saml2.ServiceProvider({
    entity_id: process.env.SAML_ENTITY_ID,
    private_key:
      process.env.SAML_SP_CRT &&
      String(
        readFileSync(join(__dirname, `../../${process.env.SAML_SP_CRT}.pem`))
      ),
    certificate:
      process.env.SAML_SP_CRT &&
      String(
        readFileSync(join(__dirname, `../../${process.env.SAML_SP_CRT}.crt`))
      ),
    assert_endpoint: process.env.SAML_ACS,
    allow_unencrypted_assertion: true,
  });

  idp = new saml2.IdentityProvider({
    sso_login_url: process.env.SAML_SSO,
    sso_logout_url: process.env.SAML_SLO,
    certificates: process.env.SAML_IDP_CRT && [
      String(
        readFileSync(join(__dirname, `../../${process.env.SAML_IDP_CRT}.crt`))
      ),
    ],
    sign_get_request: true,
  });

  module.exports = saml;

} catch {

  //Check if there are any SAML keys in the process.
  const samlKeys = Object.keys(process.env).filter(key => key.startsWith('SAML'));

  //If we have keys then log we that the module is not present
  if (samlKeys.length > 0) {
    console.log('SAML2 module is not available.')
  }

  module.exports = null;

}

/**
@function saml

@description
The saml method requires the sp and idp module variables to be declared as saml2 Service and Identity provider.

The `req.url` path is matched with either the `metadata`, `login`, or `acs` methods.

The saml metadata will be sent as `application/xml` content if requested.

The `saml/login` request path will redirect the request to a saml login request url created by the Service Provider [sp].

The sp will assert a post body sent to the `saml/acs` endpoint.

A lookup of the ACL user record will be attempted by the acl_lookup method.

The acl record with the user roles will be assigned to the user object from the saml token email.

The user object is signed as a JSON Web Token and set as a cookie to the HTTP response header.

@param {Object} req HTTP request.
@param {string} req.url Request path.
@param {Object} res HTTP response.
*/

function saml(req, res) {

  if (!sp || !idp) {
    console.warn(`SAML SP or IDP are not available in XYZ instance.`)
    return;
  }

  // Return metadata.
  if (/\/saml\/metadata/.exec(req.url)) {
    res.setHeader('Content-Type', 'application/xml');
    res.send(sp.create_metadata());
  }

  // Create Service Provider login request url.
  if (req.params?.login || /\/saml\/login/.exec(req.url)) {
    sp.create_login_request_url(idp, {},
      (err, login_url, request_id) => {
        if (err != null) return res.send(500);

        res.setHeader('location', login_url);
        res.status(301).send();
      });
  }

  if (/\/saml\/acs/.exec(req.url)) {

    sp.post_assert(
      idp,
      {
        request_body: req.body,
      },
      async (err, saml_response) => {

        if (err != null) {
          console.error(err);
          return res.send(500);
        }

        logger(saml_response, 'saml_response')

        const user = {
          email: saml_response.user.name_id,
          session_index: saml_response.user.session_index,
        }

        if (process.env.SAML_ACL) {

          const acl_response = await acl_lookup(saml_response.user.name_id)

          if (!acl_response) {
            return res.status(401).send('User account not found')
          }

          if (acl_response instanceof Error) {
            return res.status(401).send(acl_response.message)
          }

          Object.assign(user, acl_response)
        }

        // Create token with 8 hour expiry.
        const token = jwt.sign(
          user,
          process.env.SECRET,
          {
            expiresIn: parseInt(process.env.COOKIE_TTL),
          });

        const cookie =
          `${process.env.TITLE}=${token};HttpOnly;` +
          `Max-Age=${process.env.COOKIE_TTL};` +
          `Path=${process.env.DIR || '/'};`;

        res.setHeader('Set-Cookie', cookie);

        res.setHeader('location', `${process.env.DIR || '/'}`);

        return res.status(302).send();
      }
    );
  }
};

/**
@function acl_lookup

@description
The acl_lookup attempts to find a user record by it's email in the ACL.

The user record will be validated and returned to the requesting saml Assertion Consumer Service [ACS].

@param {string} email User email.

@returns {Promise<Object|Error>}
User object or Error.
*/

async function acl_lookup(email) {

  if (acl === null) {
    return new Error('ACL unavailable.')
  }

  const date = new Date()

  // Update access_log and return user record matched by email.
  const rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/, '')}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password;`,
    [email])

  if (rows instanceof Error) return new Error('Failed to query to ACL.')

  // Get user record from first row.
  const user = rows[0]

  if (!user) return null;

  // Blocked user cannot login.
  if (user.blocked) {
    return new Error('User blocked in ACL.')
  }

  // Accounts must be verified and approved for login
  if (!user.verified) {
    return new Error('User not verified in ACL')
  }

  if (!user.approved) {
    return new Error('User not approved in ACL')
  }

  return {
    roles: user.roles,
    language: user.language,
    admin: user.admin
  }
}