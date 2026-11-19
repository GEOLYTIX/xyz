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

// The redirect mock calls the actual redirect method unless a test overrides the implementation.
const redirectFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/user/redirect.js', () => ({
  default: (...args) => redirectFn(...args),
}));

/**
Returns whether the promise is still pending after the queued microtasks and timers have run.
*/
async function isPending(promise) {
  const pending = Symbol('pending');
  const result = await Promise.race([
    promise,
    new Promise((resolve) => setTimeout(() => resolve(pending))),
  ]);
  return result === pending;
}

// Set environment variables
globalThis.xyzEnv = {
  DIR: '/app',
  TITLE: 'TEST_APP',
  SECRET: 'super_secret_key',
  COOKIE_TTL: 3600,
  SECRET_ALGORITHM: 'HS256',
  JWT_TYPE: 'session',
  JWT_ISSUER: 'xyz',
  JWT_AUDIENCE: 'xyz',
};

describe('login', async () => {
  const { default: login } = await import(
    '@geolytix/xyz-app/mod/user/login.js'
  );
  const view = (await import('@geolytix/xyz-app/mod/view.js')).default;
  const { default: actualRedirect } = await vi.importActual(
    '@geolytix/xyz-app/mod/user/redirect.js',
  );

  beforeEach(() => {
    vi.clearAllMocks();
    redirectFn.mockReset();
    redirectFn.mockImplementation(actualRedirect);
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

    // Verify view rendering behavior
    expect(req.params.template).toEqual('login_view');
    expect(view).toHaveBeenCalledWith(req, res);
  });

  it('stashes an external return_to as the redirect cookie', () => {
    // The login route runs with no middleWare (router.js), so this arrives
    // via req.query in real requests, not req.params.
    const { req, res } = createMocks({
      params: {},
      query: { return_to: 'https://admin.geolytix.dev/tenant/list' },
    });

    delete req.body;
    login(req, res);

    expect(res.getHeader('Set-Cookie')).toEqual(
      `TEST_APP_redirect=${encodeURIComponent(
        'https://admin.geolytix.dev/tenant/list',
      )}; Max-Age=300; undefined`,
    );
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

  it('loginBody: returns to loginView with message for a browser form post without redirect cookie', async () => {
    fromACLFn.mockResolvedValueOnce(new Error('auth_failed'));

    const { req, res } = createMocks({
      method: 'POST',
      body: { email: 'test@email.com', password: 'wrong' },
      params: {},
      cookies: {},
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    await login(req, res);

    expect(req.params.msg).toEqual('auth_failed');
    expect(req.params.template).toEqual('login_view');
    expect(view).toHaveBeenCalledWith(req, res);
  });

  it.each([['*/*'], ['application/json, text/html;q=0']])(
    'loginBody: returns plain text 401 for Accept: %s',
    async (accept) => {
      fromACLFn.mockResolvedValueOnce(new Error('auth_failed'));

      const { req, res } = createMocks({
        method: 'POST',
        body: { email: 'test@email.com', password: 'wrong' },
        params: {},
        cookies: {},
        headers: { accept },
      });

      await login(req, res);

      expect(res.statusCode).toEqual(401);
      expect(res._getData()).toEqual('auth_failed');
      expect(view).not.toHaveBeenCalled();
    },
  );

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
    });

    await login(req, res);

    expect(res.statusCode).toEqual(302);
    expect(res.getHeader('location')).toEqual('/app/');
  });

  describe('returns the promise of the view or redirect method', () => {
    const user = { email: 'test@email.com' };

    // Each branch returns the deferred promise from its dependency.
    const branches = {
      'the GET login view': {
        setup: (promise) => {
          view.mockReturnValueOnce(promise);
          const { req, res } = createMocks({ params: {} });
          delete req.body;
          return { req, res };
        },
        dependency: () => view,
        args: (req, res) => [req, res],
      },
      'the failed credentials view': {
        setup: (promise) => {
          fromACLFn.mockResolvedValueOnce(new Error('Invalid credentials'));
          view.mockReturnValueOnce(promise);
          return createMocks({
            method: 'POST',
            body: { email: 'test@email.com', password: 'wrong' },
            params: {},
            cookies: { TEST_APP_redirect: encodeURIComponent('/dashboard') },
          });
        },
        dependency: () => view,
        args: (req, res) => [req, res],
      },
      'the successful login redirect': {
        setup: (promise) => {
          fromACLFn.mockResolvedValueOnce(user);
          redirectFn.mockReturnValueOnce(promise);
          return createMocks({
            method: 'POST',
            body: { email: 'test@email.com', password: 'correct' },
            params: {},
          });
        },
        dependency: () => redirectFn,
        args: (req, res) => [req, res, user],
      },
    };

    it.each(Object.keys(branches))(
      'stays pending until %s resolves',
      async (branch) => {
        const { setup, dependency, args } = branches[branch];
        const deferred = Promise.withResolvers();
        const { req, res } = setup(deferred.promise);

        const result = login(req, res);

        expect(result).toBeInstanceOf(Promise);
        expect(await isPending(result)).toBe(true);
        expect(dependency()).toHaveBeenCalledWith(...args(req, res));

        deferred.resolve('settled');

        await expect(result).resolves.toBe('settled');
      },
    );

    it.each(Object.keys(branches))(
      'propagates the rejection of %s',
      async (branch) => {
        const { setup } = branches[branch];
        const deferred = Promise.withResolvers();
        const { req, res } = setup(deferred.promise);

        const result = login(req, res);

        expect(await isPending(result)).toBe(true);

        const error = new Error('dependency failed');
        deferred.reject(error);

        await expect(result).rejects.toBe(error);
      },
    );
  });
});
