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

Certificate files are resolved relative to the `apps/saml` package root.

@module saml-app
*/
import '../xyz/mod/utils/processEnv.js';
import { createPrivateKey, X509Certificate } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import redirect from '@geolytix/xyz-app/mod/user/redirect.js';
import { SAML } from '@node-saml/node-saml';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
The clock skew in milliseconds accepted when the NotBefore and NotOnOrAfter conditions of a SAML assertion are checked.
*/
const DEFAULT_CLOCK_SKEW_MS = 60000;

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
}

/**
@function parseClockSkew

@description
Environment values are strings. node-saml adds the skew to the current time, so a string value would be concatenated instead of added and the NotBefore check would never fail.

A negative skew disables the NotBefore and NotOnOrAfter checks in node-saml. Expired assertions would be accepted and a captured SAML response could be replayed indefinitely. Negative and non-numeric values fall back to the default skew.

@param {string} [value] The SAML_ACCEPTED_CLOCK_SKEW environment value.
@returns {number} The accepted clock skew in milliseconds.
*/
export function parseClockSkew(value) {
  if (value === undefined || value === '') return DEFAULT_CLOCK_SKEW_MS;

  const skew = Number(value);

  if (!Number.isInteger(skew) || skew < 0) {
    console.warn(
      `SAML_ACCEPTED_CLOCK_SKEW must be a non-negative integer. ${DEFAULT_CLOCK_SKEW_MS}ms is used instead of ${value}.`,
    );
    return DEFAULT_CLOCK_SKEW_MS;
  }

  return skew;
}

/**
The environment variables without which the SAML app cannot log a user in.
*/
const REQUIRED_ENV = ['SAML_ACS', 'SAML_ENTITY_ID', 'SAML_IDP_CRT', 'SAML_SSO'];

/**
@function checkSpCertificate

@description
node-saml publishes the SP certificate in the metadata and signs requests with the SP private key. The metadata fails if the certificate file does not hold exactly one X.509 certificate, eg. a bare public key or a certificate chain. The IdP rejects signed requests if the private key does not match the certificate.

@param {string} file The certificate file name.
@param {string} keyFile The private key file name.
@param {string} publicCert The certificate file content.
@param {string} privateKey The private key file content.
@throws {Error} The certificate is not a single X.509 certificate, the private key cannot be parsed, or the certificate does not match the private key.
*/
function checkSpCertificate(file, keyFile, publicCert, privateKey) {
  const certificates = publicCert.match(/-----BEGIN CERTIFICATE-----/g);

  if (certificates?.length !== 1) {
    throw new Error(`SAML: ${file} must hold exactly one X.509 certificate.`);
  }

  let certificate;

  try {
    certificate = new X509Certificate(publicCert);
  } catch (error) {
    throw new Error(`SAML: ${file} is not a valid X.509 certificate.`, {
      cause: error,
    });
  }

  let key;

  // A malformed or encrypted key throws an OpenSSL error which does not name the file.
  try {
    key = createPrivateKey(privateKey);
  } catch (error) {
    throw new Error(
      `SAML: ${keyFile} is not a valid unencrypted PEM private key.`,
      { cause: error },
    );
  }

  if (!certificate.checkPrivateKey(key)) {
    throw new Error(
      `SAML: ${file} does not match the private key in ${keyFile}.`,
    );
  }
}

/**
@function certPaths

@description
Returns the paths of the IdP certificate and SP key pair in the apps/saml directory.

Vercel ships a file with the function only if its file tracer resolves the path. The tracer resolves a join of `__dirname` and a template literal ending in the file extension to a `apps/saml/*.crt` or `apps/saml/*.pem` glob. A path joined from a directory variable is not traced, and a deployment without `apps/saml/*.crt` and `apps/saml/*.pem` in its `includeFiles` would have no certificates. Keep the joins in this form.

@param {Object} env The environment.
@returns {Object} The idpCert, privateKey and publicCert file paths.
*/
function certPaths(env) {
  return {
    idpCert: join(__dirname, `./${env.SAML_IDP_CRT}.crt`),
    privateKey: join(__dirname, `./${env.SAML_SP_CRT}.pem`),
    publicCert: join(__dirname, `./${env.SAML_SP_CRT}.crt`),
  };
}

/**
@function createSamlConfig

@description
Creates the node-saml configuration from the environment. The certificate files are read from the apps/saml directory, or from the certDir if one is given.

The configuration is checked when it is created, so that a SAML app with a missing environment variable or certificate file fails when the server starts instead of on the first login.

InResponseTo is not validated, so IdP-initiated logins are accepted.

@param {Object} [env=xyzEnv] The environment.
@param {string} [certDir] A directory with the IdP certificate and SP key pair, used in place of apps/saml by the tests.
@returns {Object} The node-saml configuration.
@throws {Error} A required environment variable or certificate file is missing or invalid.
*/
export function createSamlConfig(env = xyzEnv, certDir) {
  const missing = REQUIRED_ENV.filter((key) => !env[key]);

  if (missing.length) {
    throw new Error(
      `SAML: The ${missing.join(', ')} environment variable(s) must be set.`,
    );
  }

  const paths = certDir
    ? {
        idpCert: join(certDir, `${env.SAML_IDP_CRT}.crt`),
        privateKey: join(certDir, `${env.SAML_SP_CRT}.pem`),
        publicCert: join(certDir, `${env.SAML_SP_CRT}.crt`),
      }
    : certPaths(env);

  const readCert = (path) => {
    try {
      return String(readFileSync(path));
    } catch (error) {
      throw new Error(
        `SAML: ${basename(path)} cannot be read from ${dirname(path)}.`,
        { cause: error },
      );
    }
  };

  const privateKey = env.SAML_SP_CRT && readCert(paths.privateKey);
  const publicCert = env.SAML_SP_CRT && readCert(paths.publicCert);

  if (env.SAML_SP_CRT) {
    checkSpCertificate(
      `${env.SAML_SP_CRT}.crt`,
      `${env.SAML_SP_CRT}.pem`,
      publicCert,
      privateKey,
    );
  }

  return {
    acceptedClockSkewMs: parseClockSkew(env.SAML_ACCEPTED_CLOCK_SKEW),
    callbackUrl: env.SAML_ACS,
    entryPoint: env.SAML_SSO,
    identifierFormat: env.SAML_IDENTIFIER_FORMAT,
    idpCert: readCert(paths.idpCert),
    issuer: env.SAML_ENTITY_ID,
    logoutCallbackUrl: env.SLO_CALLBACK,
    logoutUrl: env.SAML_SLO,
    privateKey,
    providerName: env.SAML_PROVIDER_NAME,
    publicCert,
    signatureAlgorithm: env.SAML_SIGNATURE_ALGORITHM,
    validateInResponseTo: 'never',
    wantAssertionsSigned: parseBoolean(env.SAML_WANT_ASSERTIONS_SIGNED),
    wantAuthnResponseSigned: parseBoolean(
      env.SAML_AUTHN_RESPONSE_SIGNED,
      false,
    ),
    disableRequestedAuthnContext:
      env.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT === undefined
        ? true
        : env.SAML_DISABLE_REQUESTED_AUTHN_CONTEXT === 'true',
  };
}

let samlStrat;

export default function saml(req, res) {
  return samlHandler(req, res, getSamlStrat(), redirect);
}

export function createSamlHandler(strategy, redirectUser = redirect) {
  return (req, res) => samlHandler(req, res, strategy, redirectUser);
}

/**
@function getSamlStrat

@description
Returns the node-saml instance and creates it from the environment on the first call. The SAML server calls the method on startup, so that an invalid configuration fails the server start.

@returns {SAML} The node-saml instance.
@throws {Error} The SAML configuration is invalid.
*/
export function getSamlStrat() {
  samlStrat ??= new SAML(createSamlConfig());
  return samlStrat;
}

function samlHandler(req, res, strategy, redirectUser) {
  // Dispatch the mounted SAML endpoints from a single handler.
  switch (true) {
    case /\/saml\/metadata/.test(req.url):
      return metadata(res, strategy);

    case /\/saml\/logout\/callback/.test(req.url):
      return logoutCallback(req, res, strategy);

    case /\/saml\/logout/.test(req.url):
      return logout(req, res, strategy);

    case req.params?.login || /\/saml\/login/.test(req.url):
      return login(req, res, strategy);

    case /\/saml\/acs/.test(req.url):
      return acs(req, res, strategy, redirectUser);
  }
}

/**
@function metadata

@description
Sends the service provider metadata. The SP certificate is published as the signing certificate for requests signed with the SP private key.

node-saml throws if the SP certificate file does not hold exactly one X.509 certificate, eg. a bare public key or a certificate chain. The error is logged and sent as a 500 status. The request must not be left without a response.

@param {res} res HTTP response.
@param {SAML} strategy The node-saml instance.
*/
function metadata(res, strategy) {
  let metadata;

  try {
    metadata = strategy.generateServiceProviderMetadata(
      null,
      strategy.options.publicCert,
    );
  } catch (error) {
    console.error('SAML metadata generation failed:', error.message);
    return res.status(500).send('SAML metadata is not available.');
  }

  res.setHeader('Content-Type', 'application/xml');
  res.send(metadata);
}

function clearUserCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${xyzEnv.TITLE}=null; Max-Age=0; ${xyzEnv.COOKIE_PROPS}`,
  );
}

function redirectHome(res) {
  res.setHeader('location', `${xyzEnv.DIR || '/'}`);
  return res.status(302).send();
}

/**
@function logoutCallback
@async

@description
The IdP returns to the logout callback with either a LogoutResponse to a logout started from XYZ or a LogoutRequest for a logout started at the IdP or another service provider.

The user cookie is cleared in either case.

A LogoutRequest is answered with a LogoutResponse redirect to the IdP once its signature is validated.

A redirect binding LogoutRequest is validated from the raw query string. node-saml rejects a query string without a Signature parameter and returns the RelayState covered by the signature. A RelayState from the parsed req.query could hold a parameter the signature does not cover.

Any other request is redirected to the base directory.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {SAML} strategy The node-saml instance.
*/
async function logoutCallback(req, res, strategy) {
  clearUserCookie(res);

  try {
    let result;
    let relayState;

    if (req.method === 'POST' && req.body?.SAMLRequest) {
      result = await strategy.validatePostRequestAsync(req.body);
      relayState = req.body.RelayState;
    } else if (req.query?.SAMLRequest) {
      const originalQuery = req.url.split('?')[1] || '';
      result = await strategy.validateRedirectAsync(originalQuery);
      relayState = result.relayState;
    }

    if (!result?.profile) return redirectHome(res);

    const url = await strategy.getLogoutResponseUrlAsync(
      result.profile,
      relayState,
      {},
      true,
    );

    res.setHeader('location', url);
    return res.status(302).send();
  } catch (error) {
    console.error('SAML logout request validation failed:', error.message);
    return redirectHome(res);
  }
}

/**
@function logout
@async

@description
The user cookie is cleared before the user is sent to the IdP. The local session ends even if the IdP does not return to the logout callback.

A LogoutRequest is only created for a user cookie with a valid signature. An expired cookie with a valid signature still ends the IdP session. A LogoutRequest is signed with the SP private key and must not be created from an unverified nameID and sessionIndex.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {SAML} strategy The node-saml instance.
*/
async function logout(req, res, strategy) {
  const token = req.cookies?.[`${xyzEnv.TITLE}`];

  clearUserCookie(res);

  if (!token) return redirectHome(res);

  let user;

  try {
    // An expired token with a valid signature still holds the IdP session to end.
    user = jwt.verify(token, xyzEnv.SECRET, {
      algorithms: [xyzEnv.SECRET_ALGORITHM],
      ignoreExpiration: true,
    });
  } catch {
    return redirectHome(res);
  }

  if (!user.sessionIndex || !user.nameID) return redirectHome(res);

  try {
    const url = await strategy.getLogoutUrlAsync(user);

    res.setHeader('location', url);
    return res.status(302).send();
  } catch (error) {
    console.error('Logout process failed:', error);
    return redirectHome(res);
  }
}

async function login(req, res, strategy) {
  const redirect = req.cookies?.[`${xyzEnv.TITLE}_redirect`];

  try {
    //This tells the IDP where to redirect to
    const relayState = (redirect || xyzEnv.DIR) ?? '/';

    // node-saml ignores the deprecated host argument. The AuthnRequest is built from the required SAML_ACS callbackUrl.
    const url = await strategy.getAuthorizeUrlAsync(relayState, {
      additionalParams: {},
    });

    res.setHeader('location', url);
    return res.status(302).send();
  } catch (error) {
    console.error('SAML authorization error:', error);
    res.status(500).send('Authentication failed');
  }
}

/**
@function acs
@async

@description
The assertion consumer service validates the SAML response posted by the IdP.

An invalid response, or a response without an authenticated nameID, is rejected with a 401 status. Any other error is sent as a 500 status. The request must not be left without a response.

The user from a valid response is passed to the redirect method for the ACL lookup and the user cookie.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {SAML} strategy The node-saml instance.
@param {Function} redirectUser The redirect method.
*/
async function acs(req, res, strategy, redirectUser) {
  let profile;

  try {
    const samlResponse = await strategy.validatePostResponseAsync(req.body);
    profile = samlResponse?.profile;
  } catch (error) {
    console.error('SAML response validation failed:', error.message);
    return res.status(401).send('SAML authentication failed.');
  }

  if (!profile?.nameID) {
    return res.status(401).send('SAML authentication failed.');
  }

  const user = {
    email: profile.email || profile.nameID,
    lookup: true,
    nameID: profile.nameID,
    nameIDFormat: profile.nameIDFormat,
    nameQualifier: profile.nameQualifier,
    redirect: req.body?.RelayState || req.query?.RelayState,
    sessionIndex: profile.sessionIndex,
    spNameQualifier: profile.spNameQualifier,
  };

  try {
    documentRedirect(res);

    return await redirectUser(req, res, user);
  } catch (error) {
    console.error('SAML user redirect failed:', error);

    if (!res.headersSent) {
      return res.status(500).send('Authentication failed.');
    }
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
