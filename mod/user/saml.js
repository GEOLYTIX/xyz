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

let samlStrat, samlConfig, logger, jwt, acl;

try {
  const { SAML } = require('@node-saml/node-saml');

  const { join } = require('path');

  const { readFileSync } = require('fs');

  logger = require('../../mod/utils/logger');

  jwt = require('jsonwebtoken');

  acl = require('../user/acl.js');

  samlConfig = {
    callbackUrl: process.env.SAML_ACS,
    entryPoint: process.env.SAML_SSO,
    issuer: process.env.SAML_ENTITY_ID,
    idpCert:
      process.env.SAML_IDP_CRT &&
      String(
        readFileSync(join(__dirname, `../../${process.env.SAML_IDP_CRT}.crt`)),
      ),
    privateKey:
      process.env.SAML_SP_CRT &&
      String(
        readFileSync(join(__dirname, `../../${process.env.SAML_SP_CRT}.pem`)),
      ),
    publicCert:
      process.env.SAML_SP_CRT &&
      String(
        readFileSync(join(__dirname, `../../${process.env.SAML_SP_CRT}.crt`)),
      ),
    logoutUrl: process.env.SAML_SLO,
    wantAuthnResponseSigned: false,
  };

  /** @type {SAML} */
  samlStrat = new SAML(samlConfig);

  module.exports = saml;
} catch {
  //Check if there are any SAML keys in the process.
  const samlKeys = Object.keys(process.env).filter((key) =>
    key.startsWith('SAML'),
  );

  //If we have keys then log we that the module is not present
  if (samlKeys.length > 0) {
    console.log('SAML2 module is not available.');
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

async function saml(req, res) {
  if (!samlStrat) {
    console.warn(`SAML is not available in XYZ instance.`);
    return;
  }

  // Return metadata.
  if (/\/saml\/metadata/.exec(req.url)) {
    res.setHeader('Content-Type', 'application/xml');
    const metadata = samlStrat.generateServiceProviderMetadata(
      null,
      samlConfig.idpCert,
    );
    res.send(metadata);
  }

  if (/\/saml\/logout\/callback/.exec(req.url)) {
    try {
      // Most blokes will be settin' their cookies at UTC midnight
      // Where can you go from there? Nowhere.
      res.setHeader(
        'Set-Cookie',
        `${process.env.TITLE}=; HttpOnly; Path=${process.env.DIR || '/'}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`, // But these cookies go to zero. That's one less.
      );

      res.redirect(`${process.env.DIR || '/'}`);
    } catch (error) {
      console.error('Logout validation failed:', error);
      return res.redirect('/');
    }
  }

  if (/\/saml\/logout/.exec(req.url)) {
    try {
      const user = await jwt.decode(req.cookies[`${process.env.TITLE}`]);

      if (!user) return;
      let url = process.env.DIR || '/';

      if (user.sessionIndex) {
        url = await samlStrat.getLogoutUrlAsync(user);
      } else {
        // Most blokes will be settin' their cookies at UTC midnight
        // Where can you go from there? Nowhere.
        res.setHeader(
          'Set-Cookie',
          `${process.env.TITLE}=; HttpOnly; Path=${process.env.DIR || '/'}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`, // But these cookies go to zero. That's one less.
        );
      }

      res.redirect(url);
    } catch (error) {
      console.error('Logout process failed:', error);
      return res.redirect('/');
    }
  }

  if (req.params?.login || /\/saml\/login/.exec(req.url)) {
    // Create Service Provider login request url.
    try {
      // RelayState can be used to store the URL to redirect to after login
      const relayState = req.query.returnTo || process.env.DIR;

      const url = await samlStrat.getAuthorizeUrlAsync(
        relayState,
        req.get('host'), // Get host from request
        {
          additionalParams: {},
        },
      );

      res.redirect(url);
    } catch (error) {
      console.error('SAML authorization error:', error);
      res.status(500).send('Authentication failed');
    }
  }

  if (/\/saml\/acs/.exec(req.url)) {
    try {
      const samlResponse = await samlStrat.validatePostResponseAsync(req.body);
      const user = {
        email: samlResponse.profile.nameID,
        nameID: samlResponse.profile.nameID,
        sessionIndex: samlResponse.profile.sessionIndex,
        nameIDFormat: samlResponse.profile.nameIDFormat,
        nameQualifier: samlResponse.profile.nameQualifier,
        spNameQualifier: samlResponse.profile.spNameQualifier,
      };

      if (process.env.SAML_ACL) {
        const aclResponse = await aclLookUp(user.email);

        if (!aclResponse) {
          return res.status(401).send('User account not found');
        }

        if (aclResponse instanceof Error) {
          return res.status(401).send(aclResponse.message);
        }

        Object.assign(user, aclResponse);
      }

      // Create token with 8 hour expiry.
      const token = jwt.sign(user, process.env.SECRET, {
        expiresIn: parseInt(process.env.COOKIE_TTL),
      });

      const cookie =
        `${process.env.TITLE}=${token};HttpOnly;` +
        `Max-Age=${process.env.COOKIE_TTL};` +
        `Path=${process.env.DIR || '/'};`;

      res.setHeader('Set-Cookie', cookie);

      res.redirect(`${process.env.DIR || '/'}`);
    } catch (error) {
      console.log(error);
    }
  }
}

/**
@function aclLookUp

@description
The aclLookUp attempts to find a user record by it's email in the ACL.

The user record will be validated and returned to the requesting saml Assertion Consumer Service [ACS].

@param {string} email User email.

@returns {Promise<Object|Error>}
User object or Error.
*/

async function aclLookUp(email) {
  if (acl === null) {
    return new Error('ACL unavailable.');
  }

  const date = new Date();

  // Update access_log and return user record matched by email.
  const rows = await acl(
    `
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/, '')}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password;`,
    [email],
  );

  if (rows instanceof Error) return new Error('Failed to query to ACL.');

  // Get user record from first row.
  const user = rows[0];

  if (!user) return null;

  // Blocked user cannot login.
  if (user.blocked) {
    return new Error('User blocked in ACL.');
  }

  // Accounts must be verified and approved for login
  if (!user.verified) {
    return new Error('User not verified in ACL');
  }

  if (!user.approved) {
    return new Error('User not approved in ACL');
  }

  return {
    roles: user.roles,
    language: user.language,
    admin: user.admin,
  };
}
