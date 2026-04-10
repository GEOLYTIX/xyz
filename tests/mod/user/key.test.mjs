import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const aclFn = vi.fn();
vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
  acl: (...args) => aclFn(...args),
}));

describe('key:', async () => {
  globalThis.xyzEnv = {
    ...globalThis.xyzEnv,
    SECRET: 'test-secret',
    SECRET_ALGORITHM: 'HS256',
  };

  const { default: apiKey } = await import('../../../mod/user/key.js');

  const user = {
    api: true,
    verified: true,
    approved: true,
    blocked: false,
    email: 'test@email.com',
    roles: ['test'],
  };

  const { req, res } = createMocks({
    params: {
      user: 'test@email.com',
      admin: true,
    },
  });

  it('user not provided', async () => {
    const { req, res } = createMocks({
      params: {
        user: null,
      },
    });

    const key = await apiKey(req, res);

    expect(key.message === 'login_required').toBeTruthy();
  });

  it('acl throws an error', async () => {
    aclFn.mockImplementation(async () => {
      return new Error('aclFailed');
    });

    const { req, res } = createMocks({
      params: {
        user: 'test@geolytix.co.uk',
        admin: true,
      },
    });

    await apiKey(req, res);
    expect(res._getData() === 'Failed to access ACL.').toBeTruthy();
  });

  it('deny access if no user is found', async () => {
    aclFn.mockImplementation(async () => {
      return [null];
    });

    await apiKey(req, res);

    expect(res.statusCode === 401).toBeTruthy();
    expect(res._getData().includes('Unauthorized access.')).toBeTruthy();
  });

  it('deny access to unverified users', async () => {
    aclFn.mockImplementation(async () => {
      const mockUser = { ...user };
      mockUser.verified = false;
      return [mockUser];
    });

    await apiKey(req, res);

    expect(res.statusCode === 401).toBeTruthy();
    expect(res._getData().includes('Unauthorized access.')).toBeTruthy();
  });

  it('deny access to blocked users', async () => {
    aclFn.mockImplementation(async () => {
      const mockUser = { ...user };
      mockUser.blocked = true;
      return [mockUser];
    });

    await apiKey(req, res);

    expect(res.statusCode === 401).toBeTruthy();
    expect(res._getData().includes('Unauthorized access.')).toBeTruthy();
  });

  it('deny access to unapproved users', async () => {
    aclFn.mockImplementation(async () => {
      const mockUser = { ...user };
      mockUser.approved = false;
      return [mockUser];
    });

    await apiKey(req, res);

    expect(res.statusCode === 401).toBeTruthy();
    expect(res._getData().includes('Unauthorized access.')).toBeTruthy();
  });

  it('deny access to no api access users', async () => {
    aclFn.mockImplementation(async () => {
      const mockUser = { ...user };
      mockUser.api = false;
      return [mockUser];
    });

    await apiKey(req, res);

    expect(res.statusCode === 401).toBeTruthy();
    expect(res._getData().includes('Unauthorized access.')).toBeTruthy();
  });

  it('successfully generate a key', async () => {
    const { req, res } = createMocks({
      params: {
        user: user,
      },
    });

    aclFn.mockImplementation(async () => {
      return [user];
    });

    await apiKey(req, res);

    expect(res.statusCode === 200).toBeTruthy();
    expect(res._getData().startsWith('ey')).toBeTruthy();
  });
});
