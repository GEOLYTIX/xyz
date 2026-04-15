import { createMocks } from 'node-mocks-http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
const fromACLFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/user/fromACL.js', () => ({
  default: (...args) => fromACLFn(...args),
}));

vi.mock('@geolytix/xyz-app/mod/view.js', () => ({
  default: vi.fn(),
}));

vi.mock('@geolytix/xyz-app/mod/utils/redirect.js', () => ({
  setRedirect: vi.fn(),
}));

// Set environment variables
global.xyzEnv = {
  DIR: '/app',
  TITLE: 'TEST_APP',
  SECRET: 'super_secret_key',
  COOKIE_TTL: 3600,
  SECRET_ALGORITHM: 'HS256',
};

describe('login', async () => {
  const { default: login } = await import(
    '@geolytix/xyz-app/mod/user/login.js'
  );
  const view = (await import('@geolytix/xyz-app/mod/view.js')).default;
  const { setRedirect } = await import(
    '@geolytix/xyz-app/mod/utils/redirect.js'
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects an already authenticated user', () => {
    const { req, res } = createMocks({
      params: {
        user: { email: 'test@email.com' },
      },
    });
    // delete req.body to avoid hitting the loginBody logic
    delete req.body;
    login(req, res);

    expect(res.statusCode).toEqual(302);
    expect(res.getHeader('location')).toEqual('/app');
  });

  it('renders loginView and clears user cookie if no POST body is provided', () => {
    const { req, res } = createMocks({
      params: {},
    });

    // Delete req.body to simulate a request without POST data, which should trigger the loginView rendering
    delete req.body;
    login(req, res);

    // Verify the clear cookie header
    const setCookieHeader = res.getHeader('Set-Cookie');
    expect(setCookieHeader).toContain(
      'TEST_APP=null;HttpOnly;Max-Age=0;Path=/app',
    );

    // Verify view rendering behavior
    expect(setRedirect).toHaveBeenCalledWith(req, res);
    expect(req.params.template).toEqual('login_view');
    expect(view).toHaveBeenCalledWith(req, res);
  });

  it('loginBody: returns 401 if ACL throws an error and no redirect cookie exists', async () => {
    fromACLFn.mockResolvedValueOnce(new Error('Invalid credentials'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@email.com', password: 'wrong' },
      params: {},
      cookies: {}, // No redirect cookie
    });

    await login(req, res);

    expect(res.statusCode).toEqual(401);
    expect(res.getHeader('Content-Type')).toEqual('text/plain');
    expect(res._getData()).toEqual('Invalid credentials');
  });

  it('loginBody: returns to loginView with message if ACL throws an error and redirect cookie exists', async () => {
    fromACLFn.mockResolvedValueOnce(new Error('Invalid credentials'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@email.com', password: 'wrong' },
      params: {},
      cookies: {
        TEST_APP_redirect: encodeURIComponent('/dashboard'),
      },
    });

    await login(req, res);

    // Verifies it falls back to the loginView behavior with the message set
    expect(req.params.msg).toEqual('Invalid credentials');
    expect(req.params.template).toEqual('login_view');
    expect(view).toHaveBeenCalledWith(req, res);
  });

  it('loginBody: successfully authenticates, generates tokens, and sets cookies', async () => {
    const mockUser = {
      admin: true,
      email: 'test@email.com',
      language: 'en',
      roles: ['test'],
      session: 'session-123',
    };

    fromACLFn.mockResolvedValueOnce(mockUser);

    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@email.com', password: 'correct' },
      params: {},
      headers: { host: 'example.com' }, // Triggers the ';Secure' flag
      cookies: {
        TEST_APP_redirect: encodeURIComponent('/dashboard'),
      },
    });

    await login(req, res);

    expect(res.statusCode).toEqual(302);
    expect(res.getHeader('location')).toEqual('/dashboard');

    const cookies = res.getHeader('Set-Cookie');
    expect(cookies).toHaveLength(2);

    // Assert user token cookie (includes Secure flag since host != localhost)
    expect(cookies[0]).toContain('TEST_APP=');
    expect(cookies[0]).toContain(
      'HttpOnly;Max-Age=3600;Path=/app;SameSite=Strict;Secure',
    );

    // Assert redirect clearing cookie
    expect(cookies[1]).toEqual(
      'TEST_APP_redirect=null;HttpOnly;Max-Age=0;Path=/app',
    );
  });
});
