/**
Test identity provider for the SAML flow tests.

The key pairs are generated for each test run and written to a temporary directory. No key material is committed.

node-saml parses the SP publicCert as an X.509 certificate for the metadata. Node can verify but not create a certificate, so a minimal self-signed certificate is DER encoded here.
*/
import {
  createPublicKey,
  generateKeyPairSync,
  sign,
  X509Certificate,
} from 'node:crypto';
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

The IdP certificate is written as idp.crt and the SP key pair as sp.pem and sp.crt, matching SAML_IDP_CRT=idp and SAML_SP_CRT=sp.
*/
export function createKeys() {
  const keys = { attacker: keyPair(), idp: keyPair(), sp: keyPair() };

  keys.idp.certificate = selfSignedCertificate(keys.idp, 'xyz-saml-test-idp');
  keys.sp.certificate = selfSignedCertificate(keys.sp, 'xyz-saml-test-sp');

  const certDir = mkdtempSync(join(tmpdir(), 'xyz-saml-'));
  writeFileSync(join(certDir, 'idp.crt'), keys.idp.certificate);
  writeFileSync(join(certDir, 'sp.pem'), keys.sp.privateKey);
  writeFileSync(join(certDir, 'sp.crt'), keys.sp.certificate);

  return { ...keys, certDir };
}

function der(tag, ...content) {
  const body = Buffer.concat(content);
  let length;

  if (body.length < 0x80) {
    length = Buffer.from([body.length]);
  } else {
    const bytes = [];
    for (let n = body.length; n > 0; n >>= 8) bytes.unshift(n & 0xff);
    length = Buffer.from([0x80 | bytes.length, ...bytes]);
  }

  return Buffer.concat([Buffer.from([tag]), length, body]);
}

const SEQUENCE = 0x30;

// sha256WithRSAEncryption 1.2.840.113549.1.1.11 with NULL parameters.
const SHA256_WITH_RSA = der(
  SEQUENCE,
  Buffer.from('06092a864886f70d01010b', 'hex'),
  Buffer.from('0500', 'hex'),
);

function name(commonName) {
  // SEQUENCE { SET { SEQUENCE { commonName 2.5.4.3, UTF8String } } }
  return der(
    SEQUENCE,
    der(
      0x31,
      der(
        SEQUENCE,
        Buffer.from('0603550403', 'hex'),
        der(0x0c, Buffer.from(commonName)),
      ),
    ),
  );
}

function generalizedTime(date) {
  const time = date.toISOString().replace(/[-:T]/g, '').slice(0, 14);
  return der(0x18, Buffer.from(`${time}Z`));
}

/**
Returns a PEM X.509 v3 certificate for the key pair, signed with its own private key.
*/
function selfSignedCertificate({ privateKey, publicKey }, commonName) {
  const now = Date.now();

  const tbsCertificate = der(
    SEQUENCE,
    der(0xa0, der(0x02, Buffer.from([2]))),
    der(0x02, Buffer.from([1])),
    SHA256_WITH_RSA,
    name(commonName),
    der(
      SEQUENCE,
      generalizedTime(new Date(now - 60 * 60 * 1000)),
      generalizedTime(new Date(now + 24 * 60 * 60 * 1000)),
    ),
    name(commonName),
    createPublicKey(publicKey).export({ format: 'der', type: 'spki' }),
  );

  const signature = sign('sha256', tbsCertificate, privateKey);

  const certificate = der(
    SEQUENCE,
    tbsCertificate,
    SHA256_WITH_RSA,
    der(0x03, Buffer.from([0]), signature),
  );

  const pem = `-----BEGIN CERTIFICATE-----\n${certificate
    .toString('base64')
    .match(/.{1,64}/g)
    .join('\n')}\n-----END CERTIFICATE-----\n`;

  // Throws for a malformed certificate.
  new X509Certificate(pem);

  return pem;
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
