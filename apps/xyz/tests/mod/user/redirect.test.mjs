import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const aclFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

globalThis.xyzEnv = {
  COOKIE_TTL: 3600,
  DIR: '/app',
  SECRET: 'test-secret',
  SECRET_ALGORITHM: 'HS256',
  TITLE: 'TEST_APP',
};

describe('redirect:', async () => {
  const { default: redirect } = await import(
    '@geolytix/xyz-app/mod/user/redirect.js'
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('looks up ACL details, signs a cookie, clears redirect cookie, and redirects', async () => {
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

    const { req, res } = createMocks({
      cookies: {
        TEST_APP_redirect: encodeURIComponent('/app/dashboard'),
      },
      headers: { host: 'example.com' },
    });

    await redirect(req, res, { email: 'test@example.com', lookup: true });

    const cookies = res.getHeader('Set-Cookie');
    const token = cookies[0].match(/^TEST_APP=([^;]+)/)[1];

    expect(aclFn).toHaveBeenCalledWith(expect.stringContaining('approved'), [
      'test@example.com',
    ]);
    expect(jwt.verify(token, 'test-secret')).toMatchObject({
      admin: true,
      email: 'test@example.com',
      language: 'en',
      roles: ['admin'],
    });
    expect(cookies[1]).toEqual('TEST_APP_redirect=null; Max-Age=0; undefined');
    expect(res.statusCode).toBe(302);
    expect(res.getHeader('location')).toBe('/app/dashboard');
  });

  it('rejects missing ACL users instead of signing the provided user', async () => {
    aclFn.mockResolvedValueOnce([]);

    const { req, res } = createMocks({
      headers: { host: 'localhost:3000' },
    });

    await redirect(req, res, { email: 'missing@example.com', lookup: true });

    expect(res.statusCode).toBe(401);
    expect(res._getData()).toBe('User not found.');
    expect(res.getHeader('Set-Cookie')).toBeUndefined();
  });

  it('rejects blocked ACL users and clears the user cookie', async () => {
    aclFn.mockResolvedValueOnce([
      {
        blocked: true,
        email: 'blocked@example.com',
      },
    ]);

    const { req, res } = createMocks({
      headers: { host: 'localhost:3000' },
    });

    await redirect(req, res, { email: 'blocked@example.com', lookup: true });

    const header = res.getHeader('Set-Cookie');

    expect(res.statusCode).toBe(403);
    expect(res._getData()).toBe('User blocked in ACL.');
    expect(header).toBe('TEST_APP=null; Max-Age=0; undefined');
  });

  it('falls back to DIR for unsafe redirect cookie values', async () => {
    const { req, res } = createMocks({
      cookies: {
        TEST_APP_redirect: encodeURIComponent('//example.com/phish'),
      },
      headers: { host: 'localhost:3000' },
    });

    await redirect(req, res, { email: 'test@example.com' });

    expect(res.getHeader('location')).toBe('/app/');
  });
});
