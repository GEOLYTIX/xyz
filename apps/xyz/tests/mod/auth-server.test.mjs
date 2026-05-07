import { createMocks } from 'node-mocks-http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const app = {
  get: vi.fn(),
  post: vi.fn(),
};
const redirectFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/user/redirect.js', () => ({
  default: (...args) => redirectFn(...args),
}));

vi.mock('express', () => ({
  default: {
    json: vi.fn(() => 'json-middleware'),
    urlencoded: vi.fn(() => 'urlencoded-middleware'),
  },
}));

globalThis.xyzEnv = {
  DIR: '/app',
};

describe('auth-server:', async () => {
  const { default: registerAuthRoutes } = await import('../../../auth/auth.js');
  registerAuthRoutes(app, redirectFn);

  beforeEach(() => {
    redirectFn.mockClear();
  });

  it('registers custom auth routes under DIR', () => {
    expect(app.get).toHaveBeenCalledWith(
      '/app/custom/login',
      expect.any(Function),
    );
    expect(app.post).toHaveBeenCalledWith(
      '/app/custom/verify',
      ['urlencoded-middleware', 'json-middleware'],
      expect.any(Function),
    );
  });

  it('renders a login form posting back under DIR', () => {
    const customLogin = app.get.mock.calls[0][1];
    const { req, res } = createMocks();

    customLogin(req, res);

    expect(res._getData()).toContain('action="/app/custom/verify"');
  });

  it('passes custom verify users through the shared redirect helper', async () => {
    const customVerify = app.post.mock.calls[0][2];
    const { req, res } = createMocks({
      body: {
        username: 'test@example.com',
      },
    });

    await customVerify(req, res);

    expect(redirectFn).toHaveBeenCalledWith(req, res, {
      email: 'test@example.com',
      lookup: true,
    });
  });
});
