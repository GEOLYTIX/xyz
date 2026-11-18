/**
The SAML flow tests run the handler with a real node-saml instance created from createSamlConfig.

The test IdP signs responses and logout requests with keys generated for the test run. Only the ACL is mocked.
*/
import { generateKeyPairSync } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { SAML } from '@node-saml/node-saml';
import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createKeys,
  IDP_ISSUER,
  logoutRequestUrl,
  pemBody,
  postLogoutRequest,
  queryOf,
  samlResponse,
} from './idp.mjs';

const aclFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

globalThis.xyzEnv = {
  COOKIE_PROPS: 'Secure; HttpOnly; SameSite=Strict; Path=/app',
  COOKIE_TTL: 3600,
  DIR: '/app',
  JWT_AUDIENCE: 'xyz',
  JWT_ISSUER: 'xyz',
  JWT_TYPE: 'session',
  SECRET: 'test-secret',
  SECRET_ALGORITHM: 'HS256',
  TITLE: 'TEST_APP',
};

const ACS = 'https://sp.example.com/app/saml/acs';
const ENTITY_ID = 'https://sp.example.com/app';

const samlEnv = {
  SAML_ACS: ACS,
  SAML_ENTITY_ID: ENTITY_ID,
  SAML_IDP_CRT: 'idp',
  SAML_SIGNATURE_ALGORITHM: 'sha256',
  SAML_SLO: 'https://idp.example.com/slo',
  SAML_SP_CRT: 'sp',
  SAML_SSO: 'https://idp.example.com/sso',
};

const aclUser = {
  admin: false,
  approved: true,
  blocked: false,
  email: 'test@example.com',
  language: 'en',
  roles: ['editor'],
  verified: true,
};

describe('saml flow:', async () => {
  const { createSamlConfig, createSamlHandler } = await import('../saml.js');

  const keys = createKeys();
  const config = createSamlConfig(samlEnv, keys.certDir);
  const strategy = new SAML(config);
  const saml = createSamlHandler(strategy);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function postACS(body) {
    const { req, res } = createMocks({
      body,
      cookies: {},
      method: 'POST',
      url: '/app/saml/acs',
    });
    return saml(req, res).then(() => res);
  }

  describe('metadata', () => {
    it('publishes the SP certificate, not the IdP certificate, as the signing key', async () => {
      const { req, res } = createMocks({ url: '/app/saml/metadata' });

      await saml(req, res);

      // The metadata wraps the certificate in lines of 64 characters.
      const xml = res._getData().replace(/\s/g, '');

      expect(xml).toContain('use="signing"');
      expect(xml).toContain(pemBody(keys.sp.certificate));
      expect(xml).not.toContain(pemBody(keys.idp.certificate));
    });
  });

  describe('login', () => {
    function login(cookies = {}) {
      const { req, res } = createMocks({
        cookies,
        headers: {},
        url: '/app/saml/login',
      });
      return saml(req, res).then(() => res);
    }

    it('redirects to the IdP with a signed AuthnRequest and the redirect cookie as RelayState', async () => {
      const res = await login({ TEST_APP_redirect: '/app/view' });

      expect(res.statusCode).toBe(302);

      const location = new URL(res.getHeader('location'));
      expect(location.origin + location.pathname).toBe(
        'https://idp.example.com/sso',
      );
      expect(location.searchParams.get('RelayState')).toBe('/app/view');
      expect(location.searchParams.get('Signature')).toBeTruthy();

      const authnRequest = String(
        inflateRawSync(
          Buffer.from(location.searchParams.get('SAMLRequest'), 'base64'),
        ),
      );
      expect(authnRequest).toContain(ACS);
      expect(authnRequest).toContain(ENTITY_ID);
    });

    it('uses DIR as RelayState without a redirect cookie', async () => {
      const res = await login();

      const location = new URL(res.getHeader('location'));
      expect(location.searchParams.get('RelayState')).toBe('/app');
    });

    it('sends a 500 when the AuthnRequest cannot be created', async () => {
      const failing = createSamlHandler({
        getAuthorizeUrlAsync: () => Promise.reject(new Error('no IdP')),
      });
      const { req, res } = createMocks({ headers: {}, url: '/app/saml/login' });

      await failing(req, res);

      expect(res.statusCode).toBe(500);
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('acs', () => {
    it('signs a user cookie from a valid IdP response', async () => {
      aclFn.mockResolvedValueOnce([aclUser]);

      const res = await postACS({
        RelayState: encodeURIComponent('/app/dashboard'),
        SAMLResponse: samlResponse({
          acs: ACS,
          audience: ENTITY_ID,
          privateKey: keys.idp.privateKey,
        }),
      });

      expect(res.statusCode).toBe(200);
      expect(res._getData()).toContain('content="0;url=/app/dashboard"');

      const token = res
        .getHeader('Set-Cookie')[0]
        .match(/^TEST_APP=([^;]+)/)[1];

      const user = jwt.verify(token, 'test-secret');

      expect(user).toMatchObject({
        email: 'test@example.com',
        nameID: 'name-id',
        roles: ['editor'],
        sessionIndex: 'session-index',
      });
      expect(user).not.toHaveProperty('redirect');
      expect(user).not.toHaveProperty('lookup');
    });

    it('rejects an expired assertion', async () => {
      const res = await postACS({
        SAMLResponse: samlResponse({
          acs: ACS,
          audience: ENTITY_ID,
          issuedAt: Date.now() - 60 * 60 * 1000,
          privateKey: keys.idp.privateKey,
        }),
      });

      expect(res.statusCode).toBe(401);
      expect(res.getHeader('Set-Cookie')).toBeUndefined();
      expect(aclFn).not.toHaveBeenCalled();
    });

    it('rejects a replayed response once the assertion has expired', async () => {
      aclFn.mockResolvedValue([aclUser]);

      const SAMLResponse = samlResponse({
        acs: ACS,
        audience: ENTITY_ID,
        privateKey: keys.idp.privateKey,
      });

      expect((await postACS({ SAMLResponse })).statusCode).toBe(200);

      vi.useFakeTimers({ now: Date.now() + 60 * 60 * 1000, toFake: ['Date'] });

      expect((await postACS({ SAMLResponse })).statusCode).toBe(401);
    });

    it('rejects a response signed by another key', async () => {
      const res = await postACS({
        SAMLResponse: samlResponse({
          acs: ACS,
          audience: ENTITY_ID,
          privateKey: keys.attacker.privateKey,
        }),
      });

      expect(res.statusCode).toBe(401);
      expect(aclFn).not.toHaveBeenCalled();
    });

    it('rejects an unsigned response', async () => {
      const res = await postACS({
        SAMLResponse: samlResponse({ acs: ACS, audience: ENTITY_ID }),
      });

      expect(res.statusCode).toBe(401);
      expect(aclFn).not.toHaveBeenCalled();
    });

    it('rejects an assertion which is not yet valid', async () => {
      const res = await postACS({
        SAMLResponse: samlResponse({
          acs: ACS,
          audience: ENTITY_ID,
          issuedAt: Date.now() + 5 * 60 * 1000,
          privateKey: keys.idp.privateKey,
        }),
      });

      expect(res.statusCode).toBe(401);
    });

    it('rejects a response for another audience', async () => {
      const res = await postACS({
        SAMLResponse: samlResponse({
          acs: ACS,
          audience: 'https://other-sp.example.com',
          privateKey: keys.idp.privateKey,
        }),
      });

      expect(res.statusCode).toBe(401);
    });

    it('responds to a request without a SAMLResponse', async () => {
      const res = await postACS({});

      expect(res.statusCode).toBe(401);
      expect(res._isEndCalled()).toBe(true);
    });
  });

  describe('logout', () => {
    it('clears the user cookie and sends a signed LogoutRequest to the IdP', async () => {
      const token = jwt.sign(
        {
          email: 'test@example.com',
          nameID: 'name-id',
          sessionIndex: 'session-index',
        },
        'test-secret',
      );

      const { req, res } = createMocks({
        cookies: { TEST_APP: token },
        url: '/app/saml/logout',
      });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);

      const location = new URL(res.getHeader('location'));
      expect(location.origin + location.pathname).toBe(
        'https://idp.example.com/slo',
      );
      expect(location.searchParams.get('Signature')).toBeTruthy();

      const logoutRequest = String(
        inflateRawSync(
          Buffer.from(location.searchParams.get('SAMLRequest'), 'base64'),
        ),
      );
      expect(logoutRequest).toContain('name-id');
      expect(logoutRequest).toContain('session-index');
    });

    it('keeps the NameID format and qualifiers in the LogoutRequest after the cookie is refreshed (#3091)', async () => {
      const { default: cookie } = await import(
        '@geolytix/xyz-app/mod/user/cookie.js'
      );

      aclFn.mockResolvedValue([aclUser]);

      const PERSISTENT = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent';

      const acsRes = await postACS({
        SAMLResponse: samlResponse({
          acs: ACS,
          audience: ENTITY_ID,
          nameIDFormat: PERSISTENT,
          nameQualifier: IDP_ISSUER,
          privateKey: keys.idp.privateKey,
          spNameQualifier: ENTITY_ID,
        }),
      });

      expect(acsRes.statusCode).toBe(200);

      const loginToken = acsRes
        .getHeader('Set-Cookie')[0]
        .match(/^TEST_APP=([^;]+)/)[1];

      // The cookie is refreshed through the /api/user/cookie route of the XYZ app.
      const refresh = createMocks({
        cookies: { TEST_APP: loginToken },
        params: {},
      });

      await cookie(refresh.req, refresh.res);

      await vi.waitFor(() => expect(refresh.res._isEndCalled()).toBe(true));

      const refreshedToken = refresh.res
        .getHeader('Set-Cookie')
        .match(/^TEST_APP=([^;]+)/)[1];

      const { req, res } = createMocks({
        cookies: { TEST_APP: refreshedToken },
        url: '/app/saml/logout',
      });

      await saml(req, res);

      const location = new URL(res.getHeader('location'));
      expect(location.origin + location.pathname).toBe(
        'https://idp.example.com/slo',
      );

      const logoutRequest = String(
        inflateRawSync(
          Buffer.from(location.searchParams.get('SAMLRequest'), 'base64'),
        ),
      );

      const nameID = logoutRequest.match(
        /<saml:NameID[^>]*>[^<]*<\/saml:NameID>/,
      )?.[0];

      expect(nameID).toContain(`Format="${PERSISTENT}"`);
      expect(nameID).toContain(`NameQualifier="${IDP_ISSUER}"`);
      expect(nameID).toContain(`SPNameQualifier="${ENTITY_ID}"`);
      expect(nameID).toContain('>name-id<');
      expect(logoutRequest).toContain('session-index');
    });

    it('does not send a LogoutRequest for a cookie with an invalid signature', async () => {
      const forged = jwt.sign(
        { nameID: 'victim@example.com', sessionIndex: 'victim-session' },
        'attacker-secret',
      );

      const { req, res } = createMocks({
        cookies: { TEST_APP: forged },
        url: '/app/saml/logout',
      });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('location')).toBe('/app');
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);
    });

    it('ends the IdP session for an expired cookie with a valid signature', async () => {
      const expired = jwt.sign(
        {
          exp: Math.floor(Date.now() / 1000) - 60,
          nameID: 'name-id',
          sessionIndex: 'session-index',
        },
        'test-secret',
      );

      const { req, res } = createMocks({
        cookies: { TEST_APP: expired },
        url: '/app/saml/logout',
      });

      await saml(req, res);

      expect(new URL(res.getHeader('location')).origin).toBe(
        'https://idp.example.com',
      );
    });
  });

  describe('logout callback', () => {
    it('answers a signed IdP LogoutRequest with a LogoutResponse', async () => {
      const url = logoutRequestUrl({
        callback: '/app/saml/logout/callback',
        privateKey: keys.idp.privateKey,
      });

      const { req, res } = createMocks({ query: queryOf(url), url });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);

      const location = new URL(res.getHeader('location'));
      expect(location.origin + location.pathname).toBe(
        'https://idp.example.com/slo',
      );
      expect(location.searchParams.get('RelayState')).toBe('idp-relay-state');

      const logoutResponse = String(
        inflateRawSync(
          Buffer.from(location.searchParams.get('SAMLResponse'), 'base64'),
        ),
      );
      expect(logoutResponse).toContain('LogoutResponse');
      expect(logoutResponse).toContain('InResponseTo="_logout"');
      expect(logoutResponse).toContain('status:Success');
    });

    it('does not answer an unsigned LogoutRequest', async () => {
      const url = logoutRequestUrl({ callback: '/app/saml/logout/callback' });

      const { req, res } = createMocks({ query: queryOf(url), url });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('location')).toBe('/app');
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);
    });

    it('does not answer a LogoutRequest with an unsigned RelayState added to the query', async () => {
      const url = `${logoutRequestUrl({
        callback: '/app/saml/logout/callback',
        privateKey: keys.idp.privateKey,
      })}&RelayState=${encodeURIComponent('https://evil.example')}`;

      const { req, res } = createMocks({ query: queryOf(url), url });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('location')).toBe('/app');
    });

    it('does not answer a LogoutRequest signed by another key', async () => {
      const url = logoutRequestUrl({
        callback: '/app/saml/logout/callback',
        privateKey: keys.attacker.privateKey,
      });

      const { req, res } = createMocks({ query: queryOf(url), url });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('location')).toBe('/app');
    });

    function postCallback(SAMLRequest) {
      const { req, res } = createMocks({
        body: { RelayState: 'idp-relay-state', SAMLRequest },
        method: 'POST',
        url: '/app/saml/logout/callback',
      });
      return saml(req, res).then(() => res);
    }

    it('answers a signed POST binding LogoutRequest with a LogoutResponse', async () => {
      const res = await postCallback(
        postLogoutRequest({ privateKey: keys.idp.privateKey }),
      );

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);

      const location = new URL(res.getHeader('location'));
      expect(location.origin + location.pathname).toBe(
        'https://idp.example.com/slo',
      );

      const logoutResponse = String(
        inflateRawSync(
          Buffer.from(location.searchParams.get('SAMLResponse'), 'base64'),
        ),
      );
      expect(logoutResponse).toContain('InResponseTo="_post_logout"');
    });

    it('does not answer an unsigned POST binding LogoutRequest', async () => {
      const res = await postCallback(postLogoutRequest({}));

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('location')).toBe('/app');
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);
    });

    it('redirects home on an SP initiated LogoutResponse', async () => {
      const { req, res } = createMocks({
        query: { SAMLResponse: 'response' },
        url: '/app/saml/logout/callback?SAMLResponse=response',
      });

      await saml(req, res);

      expect(res.statusCode).toBe(302);
      expect(res.getHeader('location')).toBe('/app');
      expect(res.getHeader('Set-Cookie')).toMatch(/^TEST_APP=null; Max-Age=0/);
    });
  });
});

describe('createSamlConfig:', async () => {
  const { createSamlConfig, parseClockSkew } = await import('../saml.js');
  const keys = createKeys();

  it('reads the certificates from the cert directory', () => {
    const config = createSamlConfig(samlEnv, keys.certDir);

    expect(config.idpCert).toBe(keys.idp.certificate);
    expect(config.privateKey).toBe(keys.sp.privateKey);
    expect(config.publicCert).toBe(keys.sp.certificate);
  });

  it('checks assertion timestamps by default', () => {
    expect(createSamlConfig(samlEnv, keys.certDir).acceptedClockSkewMs).toBe(
      60000,
    );
  });

  it('parses the clock skew environment string as a number', () => {
    expect(parseClockSkew('10000')).toBe(10000);
    expect(parseClockSkew('0')).toBe(0);
  });

  it('does not allow the timestamp checks to be disabled', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(parseClockSkew('-1')).toBe(60000);
    expect(parseClockSkew('five')).toBe(60000);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });

  it('does not require InResponseTo, so IdP-initiated logins are accepted', () => {
    const config = createSamlConfig(samlEnv, keys.certDir);

    expect(config.validateInResponseTo).toBe('never');
  });

  it('names the missing environment variables', () => {
    const { SAML_ACS, SAML_SSO, ...env } = samlEnv;

    expect(() => createSamlConfig(env, keys.certDir)).toThrow(
      'SAML: The SAML_ACS, SAML_SSO environment variable(s) must be set.',
    );
  });

  it('names a certificate file which cannot be read', () => {
    expect(() =>
      createSamlConfig({ ...samlEnv, SAML_IDP_CRT: 'missing' }, keys.certDir),
    ).toThrow(`SAML: missing.crt cannot be read from ${keys.certDir}.`);
  });

  function certDir(files) {
    const dir = mkdtempSync(join(tmpdir(), 'xyz-saml-config-'));
    writeFileSync(join(dir, 'idp.crt'), keys.idp.certificate);

    for (const [file, content] of Object.entries(files)) {
      writeFileSync(join(dir, file), content);
    }

    return dir;
  }

  it('rejects an SP certificate chain', () => {
    const dir = certDir({
      'sp.crt': `${keys.sp.certificate}
${keys.idp.certificate}`,
      'sp.pem': keys.sp.privateKey,
    });

    expect(() => createSamlConfig(samlEnv, dir)).toThrow(
      'SAML: sp.crt must hold exactly one X.509 certificate.',
    );
  });

  it('rejects a bare public key as the SP certificate', () => {
    const dir = certDir({
      'sp.crt': keys.sp.publicKey,
      'sp.pem': keys.sp.privateKey,
    });

    expect(() => createSamlConfig(samlEnv, dir)).toThrow(
      'SAML: sp.crt must hold exactly one X.509 certificate.',
    );
  });

  it('rejects an SP certificate which does not match the private key', () => {
    const dir = certDir({
      'sp.crt': keys.idp.certificate,
      'sp.pem': keys.sp.privateKey,
    });

    expect(() => createSamlConfig(samlEnv, dir)).toThrow(
      'SAML: sp.crt does not match the private key in sp.pem.',
    );
  });

  function keyError(privateKey) {
    const dir = certDir({
      'sp.crt': keys.sp.certificate,
      'sp.pem': privateKey,
    });

    try {
      createSamlConfig(samlEnv, dir);
    } catch (error) {
      return error;
    }
  }

  it('names the private key file which cannot be parsed', () => {
    const error = keyError(
      '-----BEGIN PRIVATE KEY-----\nnot a key\n-----END PRIVATE KEY-----\n',
    );

    expect(error.message).toBe(
      'SAML: sp.pem is not a valid unencrypted PEM private key.',
    );
    expect(error.cause).toBeInstanceOf(Error);
  });

  it('names an encrypted private key file', () => {
    const { privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: {
        cipher: 'aes-256-cbc',
        format: 'pem',
        passphrase: 'passphrase',
        type: 'pkcs8',
      },
      publicKeyEncoding: { format: 'pem', type: 'spki' },
    });

    const error = keyError(privateKey);

    expect(error.message).toBe(
      'SAML: sp.pem is not a valid unencrypted PEM private key.',
    );
    expect(error.cause).toBeInstanceOf(Error);
  });
});
