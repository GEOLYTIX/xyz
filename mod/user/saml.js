const saml2 = require("@geolytix/saml2-js");

const { join } = require("path");

const { readFileSync } = require("fs");

const logger = require('../utils/logger')

const acl = require('./acl')()

const jwt = require("jsonwebtoken");

const sp = new saml2.ServiceProvider({
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

const idp = new saml2.IdentityProvider({
  sso_login_url: process.env.SAML_SSO,
  sso_logout_url: process.env.SAML_SLO,
  certificates: process.env.SAML_IDP_CRT && [
    String(
      readFileSync(join(__dirname, `../../${process.env.SAML_IDP_CRT}.crt`))
    ),
  ],
  sign_get_request: true,
});

module.exports = (req, res) => {
  
  if (req.url.match(/\/saml\/metadata/)) {
    res.setHeader("Content-Type", "application/xml");
    res.send(sp.create_metadata());
  }

  // if (req.url.match(/\/saml\/logout/)) {
  //   const cookie = req.cookies && req.cookies[process.env.TITLE];

  //   jwt.verify(cookie, process.env.SECRET, (err, user) => {
  //     if (err) return err;

  //     sp.create_logout_request_url(
  //       idp,
  //       {
  //         name_id: user.name_id,
  //         session_index: user.session_index,
  //       },
  //       (err, logout_url) => {
  //         if (err != null) return res.send(500);

  //         res.setHeader("location", logout_url);
  //         res.status(301).send();
  //       }
  //     );
  //   });
  // }

  if (req.params?.login || req.url.match(/\/saml\/login/)) {
    sp.create_login_request_url(idp, {}, (err, login_url, request_id) => {
      if (err != null) return res.send(500);

      res.setHeader("location", login_url);
      res.status(301).send();
    });
  }

  if (req.url.match(/\/saml\/acs/)) {

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
          }
        );

        const cookie =
          `${process.env.TITLE}=${token};HttpOnly;` +
          `Max-Age=${process.env.COOKIE_TTL};` +
          `Path=${process.env.DIR || "/"};`;

        res.setHeader("Set-Cookie", cookie);

        res.setHeader("location", `${process.env.DIR || '/'}`);

        return res.status(302).send();
      }
    );
  }
};

async function acl_lookup(email) {

  if (!acl) {
    return new Error('ACL unavailable.')
  }

  const date = new Date()

  // Update access_log and return user record matched by email.
  var rows = await acl(`
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/,'')}')
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