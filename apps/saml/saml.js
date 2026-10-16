/**
Extracted SAML backend app for XYZ.

This file used to live inside `apps/xyz/mod/user/saml.js`. It was moved into
its own app so a backend can add or omit SAML explicitly by registering the app
through the extension system in the root `server.js`.

The handler serves the complete SAML flow:

- metadata generation
- login redirect
- ACS response validation
- ACL enrichment
- same-site document redirect after ACS
- logout redirect and logout callback handling

Certificate files are still resolved relative to the `apps/xyz` package root so
existing deployment layout and environment variables continue to work.

@module saml-app
*/
import '../xyz/mod/utils/processEnv.js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import redirect from '@geolytix/xyz-app/mod/user/redirect.js';
import { SAML } from '@node-saml/node-saml';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

const samlConfig = {
  acceptedClockSkewMs: xyzEnv.SAML_ACCEPTED_CLOCK_SKEW ?? -1,
  callbackUrl: xyzEnv.SAML_ACS,
  entryPoint: xyzEnv.SAML_SSO,
  identifierFormat: xyzEnv.SAML_IDENTIFIER_FORMAT,
  idpCert:
    xyzEnv.SAML_IDP_CRT &&
    String(readFileSync(join(__dirname, `./${xyzEnv.SAML_IDP_CRT}.crt`))),
  issuer: xyzEnv.SAML_ENTITY_ID,
  logoutCallbackUrl: xyzEnv.SLO_CALLBACK,
  logoutUrl: xyzEnv.SAML_SLO,
  privateKey:
    xyzEnv.SAML_SP_CRT &&
    String(readFileSync(join(__dirname, `./${xyzEnv.SAML_SP_CRT}.pem`))),
  providerName: xyzEnv.SAML_PROVIDER_NAME,
  publicCert:
    xyzEnv.SAML_SP_CRT &&
    String(readFileSync(join(__dirname, `./${xyzEnv.SAML_SP_CRT}.crt`))),
  signatureAlgorithm: xyzEnv.SAML_SIGNATURE_ALGORITHM,
  wantAssertionsSigned: parseBoolean(xyzEnv.SAML_WANT_ASSERTIONS_SIGNED),
  wantAuthnResponseSigned: parseBoolean(
    xyzEnv.SAML_AUTHN_RESPONSE_SIGNED,
    false,
  ),
  disableRequestedAuthnContext:
    xyzEnv.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT === undefined
      ? true
      : xyzEnv.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT === 'true',
};

let samlStrat;

export default function saml(req, res) {
  return samlHandler(req, res, getSamlStrat(), redirect);
}

export function createSamlHandler(strategy, redirectUser = redirect) {
  return (req, res) => samlHandler(req, res, strategy, redirectUser);
}

function getSamlStrat() {
  samlStrat ??= new SAML(samlConfig);
  return samlStrat;
}

function samlHandler(req, res, strategy, redirectUser) {
  if (!strategy) {
    console.warn('SAML is not available in XYZ instance.');
    return;
  }

  // Dispatch the mounted SAML endpoints from a single handler.
  switch (true) {
    case /\/saml\/metadata/.test(req.url):
      return metadata(res, strategy);

    case /\/saml\/logout\/callback/.test(req.url):
      return logoutCallback(res);

    case /\/saml\/logout/.test(req.url):
      return logout(req, res, strategy);

    case req.params?.login || /\/saml\/login/.test(req.url):
      return login(req, res, strategy);

    case /\/saml\/acs/.test(req.url):
      return acs(req, res, strategy, redirectUser);
  }
}

function metadata(res, strategy) {
  res.setHeader('Content-Type', 'application/xml');
  const metadata = strategy.generateServiceProviderMetadata(
    null,
    samlConfig.idpCert,
  );
  res.send(metadata);
}

function logoutCallback(res) {
  try {
    res.setHeader(
      'Set-Cookie',
      `${xyzEnv.TITLE}=null; Max-Age=0; ${xyzEnv.COOKIE_PROPS}`,
    );

    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    return res.status(302).send();
  } catch (error) {
    console.error('Logout validation failed:', error);

    res.setHeader('location', `${xyzEnv.DIR || '/'}`);
    return res.status(302).send();
  }
}

async function logout(req, res, strategy) {
  try {
    const user = await jwt.decode(req.cookies?.[`${xyzEnv.TITLE}`]);

    if (!user) {
      res.setHeader('location', `${xyzEnv.DIR || '/'}`);
      return res.status(302).send();
    }

    if (user.sessionIndex) {
      const url = await strategy.getLogoutUrlAsync(user);

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

async function login(req, res, strategy) {
  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  try {
    //This tells the IDP where to redirect to
    const relayState = (redirect || xyzEnv.DIR) ?? '/';
    const url = await strategy.getAuthorizeUrlAsync(
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

async function acs(req, res, strategy, redirectUser) {
  try {
    const samlResponse = await strategy.validatePostResponseAsync(req.body);

    const user = {
      email: samlResponse.profile.email || samlResponse.profile.nameID,
      lookup: true,
      nameID: samlResponse.profile.nameID,
      nameIDFormat: samlResponse.profile.nameIDFormat,
      nameQualifier: samlResponse.profile.nameQualifier,
      redirect: req.body?.RelayState || req.query?.RelayState,
      sessionIndex: samlResponse.profile.sessionIndex,
      spNameQualifier: samlResponse.profile.spNameQualifier,
    };

    documentRedirect(res);

    return await redirectUser(req, res, user);
  } catch (error) {
    console.error(error);
  }
}

/**
@function documentRedirect

@description
The ACS endpoint is requested with a cross-site POST from the IdP. A 302 response from the ACS keeps the following navigation in that cross-site chain and the browser will not send a `SameSite=Strict` user cookie with the redirected request. The user is then redirected to the login again, which loops for as long as the IdP holds a session.

The method wraps `res.status()` so that a 302 response from the redirect helper is sent as a 200 HTML document with a meta refresh to the location instead. The navigation from that document is same-site and the user cookie is sent with the default COOKIE_PROPS.

Any other status, eg. an ACL error, is sent unchanged.

@param {res} res HTTP response.
*/
function documentRedirect(res) {
  const status = res.status.bind(res);

  res.status = (code) => {
    if (code !== 302) return status(code);

    const location = escapeHTML(res.getHeader('location'));

    res.removeHeader('location');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');

    return {
      send: () =>
        status(200).send(
          `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${location}"></head><body><a href="${location}">Continue</a></body></html>`,
        ),
    };
  };
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ '"': '&quot;', '&': '&amp;', "'": '&#39;', '<': '&lt;', '>': '&gt;' })[
        char
      ],
  );
}
