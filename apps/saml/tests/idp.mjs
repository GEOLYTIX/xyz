/**
Test identity provider for the SAML flow tests.

The key pairs are generated for each test run and written to a temporary directory. No key material is committed.

node-saml accepts a PEM public key as idpCert, so no X.509 certificate is required.
*/
import { generateKeyPairSync, sign } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deflateRawSync } from 'node:zlib';
import { SignedXml } from 'xml-crypto';

export const IDP_ISSUER = 'https://idp.example.com';

const RSA_SHA256 = 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256';

function keyPair() {
  return generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
    publicKeyEncoding: { format: 'pem', type: 'spki' },
  });
}

/**
Creates IdP and SP key pairs plus an unrelated attacker key pair.

The IdP public key is written as idp.crt and the SP key pair as sp.pem and sp.crt, matching SAML_IDP_CRT=idp and SAML_SP_CRT=sp.
*/
export function createKeys() {
  const keys = { attacker: keyPair(), idp: keyPair(), sp: keyPair() };

  const certDir = mkdtempSync(join(tmpdir(), 'xyz-saml-'));
  writeFileSync(join(certDir, 'idp.crt'), keys.idp.publicKey);
  writeFileSync(join(certDir, 'sp.pem'), keys.sp.privateKey);
  writeFileSync(join(certDir, 'sp.crt'), keys.sp.publicKey);

  return { ...keys, certDir };
}

function pemBody(pem) {
  return pem.replace(/-----[^-]+-----|\s/g, '');
}

export { pemBody };

/**
Returns a base64 encoded SAML response with a signed assertion.

@param {Object} options
@param {string} options.privateKey The key to sign the assertion with. Unsigned when null.
@param {string} options.acs The ACS URL.
@param {string} options.audience The SP entity ID.
@param {number} [options.issuedAt] Issue time in ms.
@param {number} [options.validForMs] Assertion validity in ms.
*/
export function samlResponse({
  acs,
  audience,
  email = 'test@example.com',
  issuedAt = Date.now(),
  nameID = 'name-id',
  privateKey,
  sessionIndex = 'session-index',
  validForMs = 5 * 60 * 1000,
}) {
  const now = new Date(issuedAt).toISOString();
  const notOnOrAfter = new Date(issuedAt + validForMs).toISOString();

  const xml = `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_response" Version="2.0" IssueInstant="${now}" Destination="${acs}"><saml:Issuer>${IDP_ISSUER}</saml:Issuer><samlp:Status><samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/></samlp:Status><saml:Assertion ID="_assertion" Version="2.0" IssueInstant="${now}"><saml:Issuer>${IDP_ISSUER}</saml:Issuer><saml:Subject><saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">${nameID}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="${notOnOrAfter}" Recipient="${acs}"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="${now}" NotOnOrAfter="${notOnOrAfter}"><saml:AudienceRestriction><saml:Audience>${audience}</saml:Audience></saml:AudienceRestriction></saml:Conditions><saml:AuthnStatement AuthnInstant="${now}" SessionIndex="${sessionIndex}"><saml:AuthnContext><saml:AuthnContextClassRef>urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport</saml:AuthnContextClassRef></saml:AuthnContext></saml:AuthnStatement><saml:AttributeStatement><saml:Attribute Name="email"><saml:AttributeValue>${email}</saml:AttributeValue></saml:Attribute></saml:AttributeStatement></saml:Assertion></samlp:Response>`;

  if (!privateKey) return Buffer.from(xml).toString('base64');

  const signature = new SignedXml({
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
    privateKey,
    signatureAlgorithm: RSA_SHA256,
  });

  signature.addReference({
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    xpath: "//*[local-name(.)='Assertion']",
  });

  signature.computeSignature(xml, {
    location: {
      action: 'after',
      reference: "//*[local-name(.)='Assertion']/*[local-name(.)='Issuer']",
    },
  });

  return Buffer.from(signature.getSignedXml()).toString('base64');
}

/**
Returns the URL of an IdP initiated LogoutRequest with the HTTP-Redirect binding.

@param {Object} options
@param {string} options.callback The SP logout callback path.
@param {string} [options.privateKey] The key to sign the query with. Unsigned when not provided.
*/
export function logoutRequestUrl({
  callback,
  nameID = 'name-id',
  privateKey,
  relayState = 'idp-relay-state',
  sessionIndex = 'session-index',
}) {
  const now = new Date().toISOString();

  const xml = `<samlp:LogoutRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_logout" Version="2.0" IssueInstant="${now}"><saml:Issuer>${IDP_ISSUER}</saml:Issuer><saml:NameID>${nameID}</saml:NameID><samlp:SessionIndex>${sessionIndex}</samlp:SessionIndex></samlp:LogoutRequest>`;

  const encoded = deflateRawSync(Buffer.from(xml)).toString('base64');

  let query = `SAMLRequest=${encodeURIComponent(encoded)}&RelayState=${encodeURIComponent(relayState)}`;

  if (privateKey) {
    query += `&SigAlg=${encodeURIComponent(RSA_SHA256)}`;
    const signature = sign('RSA-SHA256', Buffer.from(query), privateKey);
    query += `&Signature=${encodeURIComponent(signature.toString('base64'))}`;
  }

  return `${callback}?${query}`;
}

/**
Returns the decoded query parameters of a URL as express would parse them.
*/
export function queryOf(url) {
  return Object.fromEntries(
    new URL(url, 'https://sp.example.com').searchParams,
  );
}

/**
Returns a base64 encoded IdP initiated LogoutRequest for the HTTP-POST binding.

@param {Object} options
@param {string} [options.privateKey] The key to sign the request with. Unsigned when not provided.
*/
export function postLogoutRequest({
  nameID = 'name-id',
  privateKey,
  sessionIndex = 'session-index',
}) {
  const now = new Date().toISOString();

  const xml = `<samlp:LogoutRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_post_logout" Version="2.0" IssueInstant="${now}"><saml:Issuer>${IDP_ISSUER}</saml:Issuer><saml:NameID>${nameID}</saml:NameID><samlp:SessionIndex>${sessionIndex}</samlp:SessionIndex></samlp:LogoutRequest>`;

  if (!privateKey) return Buffer.from(xml).toString('base64');

  const signature = new SignedXml({
    canonicalizationAlgorithm: 'http://www.w3.org/2001/10/xml-exc-c14n#',
    privateKey,
    signatureAlgorithm: RSA_SHA256,
  });

  signature.addReference({
    digestAlgorithm: 'http://www.w3.org/2001/04/xmlenc#sha256',
    transforms: [
      'http://www.w3.org/2000/09/xmldsig#enveloped-signature',
      'http://www.w3.org/2001/10/xml-exc-c14n#',
    ],
    xpath: "/*[local-name(.)='LogoutRequest']",
  });

  signature.computeSignature(xml, {
    location: {
      action: 'after',
      reference: "/*[local-name(.)='LogoutRequest']/*[local-name(.)='Issuer']",
    },
  });

  return Buffer.from(signature.getSignedXml()).toString('base64');
}
