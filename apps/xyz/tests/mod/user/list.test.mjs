import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const aclFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

describe('list', async () => {
  const { default: user_list } = await import(
    '@geolytix/xyz-app/mod/user/list.js'
  );

  const user = {
    api: true,
    verified: true,
    approved: true,
    blocked: false,
    email: 'test@email.com',
    roles: ['test'],
  };

  it('user missing', async () => {
    const { req, res } = createMocks({
      params: {
        user: null,
      },
    });

    const userList = await user_list(req, res);

    expect(userList.message == 'login_required').toBeTruthy();
  });

  it('admin rights not granted', async () => {
    const { req, res } = createMocks({
      params: {
        user,
      },
    });

    const userList = await user_list(req, res);

    expect(userList.message == 'admin_required').toBeTruthy();
  });

  it('acl throws an error', async () => {
    aclFn.mockImplementation(async () => {
      return new Error('aclFailed');
    });

    user.admin = true;

    const { req, res } = createMocks({
      params: {
        user: user,
      },
    });

    await user_list(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Failed to access ACL.');
  });

  it('no users found in the acl', async () => {
    aclFn.mockImplementation(async () => {
      return [];
    });

    user.admin = true;

    const { req, res } = createMocks({
      params: {
        user: user,
      },
    });

    await user_list(req, res);

    expect(res.statusCode).toEqual(202);
    expect(res._getData()).toEqual('No rows returned from table.');
  });

  it('return users', async () => {
    aclFn.mockImplementation(() => {
      return ['user1', 'user2', 'user3'];
    });

    user.admin = true;

    const { req, res } = createMocks({
      params: {
        user: user,
      },
    });

    await user_list(req, res);

    const users = await res._getData();

    expect(users).toEqual(['user1', 'user2', 'user3']);
  });
});
