import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const aclFn = vi.fn();
const redirectFn = vi.fn();
const getAuthorizeUrlAsync = vi.fn();
const getLogoutUrlAsync = vi.fn();
const validatePostResponseAsync = vi.fn();

vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

const strategy = {
  generateServiceProviderMetadata: vi.fn(() => '<xml />'),
  getAuthorizeUrlAsync,
  getLogoutUrlAsync,
  validatePostResponseAsync,
};

globalThis.xyzEnv = {
  COOKIE_TTL: 3600,
  DIR: '/app',
  SAML_ACS: 'https://sp.example.com/app/saml/acs',
  SAML_ENTITY_ID: 'xyz-test',
  SAML_SLO: 'https://idp.example.com/logout',
  SAML_SSO: 'https://idp.example.com/login',
  SECRET: 'test-secret',
  SECRET_ALGORITHM: 'HS256',
  TITLE: 'TEST_APP',
};

describe('saml:', async () => {
  const { createSamlHandler } = await import('../saml.js');
  const saml = createSamlHandler(strategy, redirectFn);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects SAML logout through the IdP when the user has a sessionIndex', async () => {
    getLogoutUrlAsync.mockResolvedValueOnce(
      'https://idp.example.com/logout?id=1',
    );

    const user = {
      email: 'test@example.com',
      nameID: 'name-id',
      sessionIndex: 'session-index',
    };

    const { req, res } = createMocks({
      cookies: {
        TEST_APP: jwt.sign(user, 'test-secret'),
      },
      url: '/app/saml/logout',
    });

    await saml(req, res);

    expect(getLogoutUrlAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        nameID: 'name-id',
        sessionIndex: 'session-index',
      }),
    );
    expect(res.statusCode).toBe(302);
    expect(res.getHeader('location')).toBe(
      'https://idp.example.com/logout?id=1',
    );
  });

  it('clears the local cookie when logout has no SAML sessionIndex', async () => {
    const { req, res } = createMocks({
      cookies: {
        TEST_APP: jwt.sign({ email: 'test@example.com' }, 'test-secret'),
      },
      url: '/app/saml/logout',
    });

    await saml(req, res);

    expect(getLogoutUrlAsync).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(302);
    expect(res.getHeader('location')).toBe('/app');
  });

  it('passes SAML identity fields from ACS to the shared redirect helper', async () => {
    validatePostResponseAsync.mockResolvedValueOnce({
      profile: {
        email: 'test@example.com',
        nameID: 'name-id',
        nameIDFormat: 'format',
        nameQualifier: 'qualifier',
        sessionIndex: 'session-index',
        spNameQualifier: 'sp-qualifier',
      },
    });

    const { req, res } = createMocks({
      body: { SAMLResponse: 'response' },
      url: '/app/saml/acs',
    });

    await saml(req, res);

    expect(validatePostResponseAsync).toHaveBeenCalledWith({
      SAMLResponse: 'response',
    });
    expect(redirectFn).toHaveBeenCalledWith(
      req,
      res,
      expect.objectContaining({
        email: 'test@example.com',
        lookup: true,
        nameID: 'name-id',
        nameIDFormat: 'format',
        nameQualifier: 'qualifier',
        sessionIndex: 'session-index',
        spNameQualifier: 'sp-qualifier',
      }),
    );
  });

  it('redirects to RelayState after ACS when the redirect cookie is unavailable', async () => {
    aclFn.mockResolvedValueOnce([
      {
        admin: true,
        approved: true,
        blocked: false,
        email: 'test@example.com',
        language: 'en',
        roles: ['admin'],
        verified: true,
      },
    ]);

    validatePostResponseAsync.mockResolvedValueOnce({
      profile: {
        email: 'test@example.com',
        nameID: 'name-id',
      },
    });

    const samlWithRedirect = createSamlHandler(strategy);

    const { req, res } = createMocks({
      body: {
        RelayState: encodeURIComponent('/app/dashboard'),
        SAMLResponse: 'response',
      },
      cookies: {},
      url: '/app/saml/acs',
    });

    await samlWithRedirect(req, res);

    const cookies = res.getHeader('Set-Cookie');
    const token = cookies[0].match(/^TEST_APP=([^;]+)/)[1];

    expect(jwt.decode(token)).not.toHaveProperty('redirect');
    expect(res.statusCode).toBe(302);
    expect(res.getHeader('location')).toBe('/app/dashboard');
  });

  it('redirects to query RelayState after ACS when provided outside the POST body', async () => {
    aclFn.mockResolvedValueOnce([
      {
        admin: true,
        approved: true,
        blocked: false,
        email: 'test@example.com',
        language: 'en',
        roles: ['admin'],
        verified: true,
      },
    ]);

    validatePostResponseAsync.mockResolvedValueOnce({
      profile: {
        email: 'test@example.com',
        nameID: 'name-id',
      },
    });

    const samlWithRedirect = createSamlHandler(strategy);

    const { req, res } = createMocks({
      body: { SAMLResponse: 'response' },
      cookies: {},
      query: { RelayState: encodeURIComponent('/app/dashboard') },
      url: '/app/saml/acs',
    });

    await samlWithRedirect(req, res);

    expect(res.statusCode).toBe(302);
    expect(res.getHeader('location')).toBe('/app/dashboard');
  });
});
