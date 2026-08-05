import { createMocks } from 'node-mocks-http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authFn = vi.fn();
vi.mock('../../mod/user/auth.js', () => ({
  default: (...args) => authFn(...args),
}));

const loginFn = vi.fn();
vi.mock('../../mod/user/login.js', () => ({
  default: (...args) => loginFn(...args),
}));

const queryFn = vi.fn();
vi.mock('../../mod/query.js', () => ({
  default: (...args) => queryFn(...args),
}));

const samlFn = vi.fn();
vi.mock('../../mod/user/saml.js', () => ({
  default: (...args) => samlFn(...args),
}));

const setRedirectFn = vi.fn();
vi.mock('../../mod/utils/redirect.js', () => ({
  setRedirect: (...args) => setRedirectFn(...args),
}));

vi.mock('../../mod/provider/_provider.js', () => ({ default: vi.fn() }));
vi.mock('../../mod/sign/_sign.js', () => ({ default: vi.fn() }));
vi.mock('../../mod/user/_user.js', () => ({ default: vi.fn() }));
vi.mock('../../mod/user/register.js', () => ({ default: vi.fn() }));
vi.mock('../../mod/view.js', () => ({ default: vi.fn() }));
const workspaceFn = vi.fn();
vi.mock('../../mod/workspace/_workspace.js', () => ({
  default: (...args) => workspaceFn(...args),
}));

describe('api', async () => {
  const { default: api } = await import('../../api/api.js');

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.xyzEnv = {
      DIR: '/app',
      PRIVATE: true,
      SAML_LOGIN: true,
      TITLE: 'TEST',
    };
  });

  it('routes key requests instead of redirecting to SAML login', async () => {
    authFn.mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      headers: { host: 'localhost' },
      params: {},
      query: { key: 'xx' },
      url: '/api/query?key=xx',
    });

    api(req, res);
    await vi.waitFor(() => expect(queryFn).toHaveBeenCalledWith(req, res));

    expect(samlFn).not.toHaveBeenCalled();
    expect(setRedirectFn).not.toHaveBeenCalled();
    expect(res.getHeader('location')).toBeUndefined();
  });

  it('redirects workspace key route params without query key or token', async () => {
    authFn.mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      headers: { host: 'localhost' },
      params: { key: 'locales' },
      query: {},
      url: '/api/workspace/locales',
    });

    api(req, res);
    await vi.waitFor(() =>
      expect(setRedirectFn).toHaveBeenCalledWith(req, res),
    );

    expect(workspaceFn).not.toHaveBeenCalled();
    expect(res.statusCode).toEqual(302);
    expect(res.getHeader('location')).toEqual('/app/saml/login');
  });

  it('does not short-circuit SAML routes when key is present', async () => {
    authFn.mockResolvedValueOnce(null);

    const { req, res } = createMocks({
      headers: { host: 'localhost' },
      params: {},
      query: { key: 'xx' },
      url: '/app/saml/login?key=xx',
    });

    api(req, res);
    await vi.waitFor(() => expect(authFn).toHaveBeenCalledWith(req, res));

    expect(samlFn).not.toHaveBeenCalled();
  });

  it('still routes SAML endpoints without key or token to SAML', () => {
    const { req, res } = createMocks({
      headers: { host: 'localhost' },
      params: {},
      query: {},
      url: '/app/saml/login',
    });

    api(req, res);

    expect(samlFn).toHaveBeenCalledWith(req, res);
    expect(authFn).not.toHaveBeenCalled();
  });
});
