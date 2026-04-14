/**
@module saml-app
@description

Extracted SAML backend app for XYZ.

This file used to live inside `apps/xyz/mod/user/saml.js`. It was moved into
its own app so a backend can add or omit SAML explicitly by registering the app
through the extension system in the root `server.js`.

The handler serves the complete SAML flow:

- metadata generation
- login redirect
- ACS response validation
- optional ACL enrichment
- logout redirect and logout callback handling

Certificate files are still resolved relative to the `apps/xyz` package root so
existing deployment layout and environment variables continue to work.
*/

import '../xyz/mod/utils/processEnv.js';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import acl from '../xyz/mod/user/acl.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let samlStrat;
let samlConfig;

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

/**
@function getModule
Initializes the optional SAML dependency and returns the active request handler.
If the dependency or required configuration is unavailable, the exported handler
responds with `405 SAML not configured`.
*/
const getModule = async () => {
  try {
    const { SAML } = await import('@node-saml/node-saml');

    samlConfig = {
      acceptedClockSkewMs: xyzEnv.SAML_ACCEPTED_CLOCK_SKEW ?? -1,
      callbackUrl: xyzEnv.SAML_ACS,
      entryPoint: xyzEnv.SAML_SSO,
      identifierFormat: xyzEnv.SAML_IDENTIFIER_FORMAT,
      idpCert:
        xyzEnv.SAML_IDP_CRT &&
        String(
          readFileSync(join(__dirname, `../xyz/${xyzEnv.SAML_IDP_CRT}.crt`)),
        ),
      issuer: xyzEnv.SAML_ENTITY_ID,
      logoutCallbackUrl: xyzEnv.SLO_CALLBACK,
      logoutUrl: xyzEnv.SAML_SLO,
      privateKey:
        xyzEnv.SAML_SP_CRT &&
        String(
          readFileSync(join(__dirname, `../xyz/${xyzEnv.SAML_SP_CRT}.pem`)),
        ),
      providerName: xyzEnv.SAML_PROVIDER_NAME,
      publicCert:
        xyzEnv.SAML_SP_CRT &&
        String(
          readFileSync(join(__dirname, `../xyz/${xyzEnv.SAML_SP_CRT}.crt`)),
        ),
      signatureAlgorithm: xyzEnv.SAML_SIGNATURE_ALGORITHM,
      wantAssertionsSigned: parseBoolean(xyzEnv.SAML_WANT_ASSERTIONS_SIGNED),
      wantAuthnResponseSigned: parseBoolean(
        xyzEnv.SAML_AUTHN_RESPONSE_SIGNED,
        false,
      ),
      disableRequestedAuthnContext:
        xyzEnv.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT !== undefined
          ? xyzEnv.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT === 'true'
          : true,
    };

    samlStrat = new SAML(samlConfig);
    return saml;
  } catch {
    const samlKeys = Object.keys(xyzEnv).filter((key) =>
      key.startsWith('SAML'),
    );

    if (samlKeys.length > 0) {
      console.log('SAML2 module is not available.');
    }

    return samlNotConfigured;
  }
};

function samlNotConfigured(req, res) {
  res.status(405).send('SAML not configured');
}

const exportedModule = await getModule();

export default exportedModule;

function saml(req, res) {
  if (!samlStrat) {
    console.warn('SAML is not available in XYZ instance.');
    return;
  }

  // Dispatch the mounted SAML endpoints from a single handler.
  switch (true) {
    case /\/saml\/metadata/.test(req.url):
      metadata(res);
      break;

    case /\/saml\/logout\/callback/.test(req.url):
      logoutCallback(res);
      break;

    case /\/saml\/logout/.test(req.url):
      logout(req, res);
      break;

    case req.params?.login || /\/saml\/login/.test(req.url):
      login(req, res);
      break;

    case /\/saml\/acs/.test(req.url):
      acs(req, res);
      break;
  }
}

function metadata(res) {
  res.setHeader('Content-Type', 'application/xml');
  const metadata = samlStrat.generateServiceProviderMetadata(
    null,
    samlConfig.idpCert,
  );
  res.send(metadata);
}

function logoutCallback(res) {
  try {
    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=; HttpOnly; Path=${xyzEnv.DIR || '/'}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    );

    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    return res.status(302).send();
  } catch (error) {
    console.error('Logout validation failed:', error);

    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    return res.status(302).send();
  }
}

async function logout(req, res) {
  try {
    const user = await jwt.decode(req.cookies[`${xyzEnv.TITLE}`]);

    if (!user) {
      res.setHeader('location', `${xyzEnv.DIR || '/'}`);
      return res.status(302).send();
    }

    if (user.sessionIndex) {
      const url = await samlStrat.getLogoutUrlAsync(user);

      res.setHeader('location', url);
      return res.status(302).send();
    }

    logoutCallback(res);
  } catch (error) {
    console.error('Logout process failed:', error);

    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    return res.status(302).send();
  }
}

async function login(req, res) {
  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  try {
    const relayState = (redirect || xyzEnv.DIR) ?? '/';
    const url = await samlStrat.getAuthorizeUrlAsync(
      relayState,
      req.headers['x-forwarded-host'],
      { additionalParams: {} },
    );

    res.setHeader('location', url);
    return res.status(302).send();
  } catch (error) {
    console.error('SAML authorization error:', error);
    res.status(500).send('Authentication failed');
  }
}

async function acs(req, res) {
  try {
    const samlResponse = await samlStrat.validatePostResponseAsync(req.body);

    const user = {
      email: samlResponse.profile.email || samlResponse.profile.nameID,
      nameID: samlResponse.profile.nameID,
      nameIDFormat: samlResponse.profile.nameIDFormat,
      nameQualifier: samlResponse.profile.nameQualifier,
      sessionIndex: samlResponse.profile.sessionIndex,
      spNameQualifier: samlResponse.profile.spNameQualifier,
    };

    // Optionally enrich the SAML profile with ACL roles from the XYZ app.
    if (xyzEnv.SAML_ACL) {
      const aclResponse = await aclLookUp(user.email);

      if (aclResponse instanceof Error && xyzEnv.SAML_SLO) {
        const url = await samlStrat.getLogoutUrlAsync(user);

        res.setHeader('location', url);
        return res.status(302).send();
      }

      if (aclResponse instanceof Error) {
        res.status(401).send(aclResponse.message);
        return;
      }

      Object.assign(user, aclResponse);
    }

    const token = jwt.sign(user, xyzEnv.SECRET, {
      expiresIn: xyzEnv.COOKIE_TTL,
      algorithm: xyzEnv.SECRET_ALGORITHM,
    });

    const cookie =
      `${xyzEnv.TITLE}=${token};HttpOnly;` +
      `Max-Age=${xyzEnv.COOKIE_TTL};` +
      `Path=${xyzEnv.DIR || '/'};`;

    res.setHeader('Set-Cookie', cookie);

    const redirect = req.body.RelayState;
    let location = xyzEnv.DIR || '/';

    if (redirect) {
      const decodedRedirect = decodeURIComponent(redirect);
      const sanitized = decodedRedirect.replaceAll(/[;\r\n]/g, '');

      if (sanitized.startsWith('/')) {
        location = sanitized;
      }
    }

    res.setHeader('location', location);

    return res.status(302).send();
  } catch (error) {
    console.error(error);
  }
}

async function aclLookUp(email) {
  if (acl === null) {
    return new Error('ACL unavailable.');
  }

  const date = new Date();
  const rows = await acl(
    `
    UPDATE acl_schema.acl_table
    SET access_log = array_append(access_log, '${date.toISOString().replace(/\..*/, '')}')
    WHERE lower(email) = lower($1)
    RETURNING email, roles, language, blocked, approved, approved_by, verified, admin, password;`,
    [email],
  );

  if (rows instanceof Error) return new Error('Failed to query to ACL.');

  const user = rows[0];

  if (!user) return new Error('User not found.');
  if (user.blocked) return new Error('User blocked in ACL.');
  if (!user.verified) return new Error('User not verified in ACL');
  if (!user.approved) return new Error('User not approved in ACL');

  return {
    admin: user.admin,
    language: user.language,
    roles: user.roles,
  };
}
