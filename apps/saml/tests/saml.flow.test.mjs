/**
The SAML flow tests run the handler with a real node-saml instance created from createSamlConfig.

The test IdP signs responses and logout requests with keys generated for the test run. Only the ACL is mocked.
*/
import { inflateRawSync } from 'node:zlib';
import { SAML } from '@node-saml/node-saml';
import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createKeys,
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
});
