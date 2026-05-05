import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const aclMockFn = vi.fn();

vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => aclMockFn(...args),
}));

const { default: addUser } = await import('../../../mod/user/add.js');

describe('add:', () => {
  it('Adding a user', async () => {
    aclMockFn.mockImplementation((q) => {
      return [];
    });

    const { req, res } = createMocks({
      params: {
        email: 'dev_1@geolytix.co.uk',
        user: {
          admin: true,
        },
      },
    });

    await addUser(req, res);

    const message = res._getData();

    expect(message).toEqual('dev_1@geolytix.co.uk added to ACL.');
  });

  it('Missing email param', async () => {
    const { req, res } = createMocks({
      params: {},
    });

    await addUser(req, res);

    const status = res.statusCode;
    const message = res._getData();

    expect(status).toEqual(500);
    expect(message).toEqual('Missing email param');
  });

  it('Missing user param', async () => {
    const { req, res } = createMocks({
      params: {
        email: 'dev_1@geolytix.co.uk',
      },
    });

    const result = await addUser(req, res);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toEqual('login_required');
  });

  it('Missing admin param', async () => {
    const { req, res } = createMocks({
      params: {
        email: 'dev_1@geolytix.co.uk',
        user: {},
      },
    });

    const result = await addUser(req, res);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toEqual('admin_required');
  });

  it('error from acl', async () => {
    aclMockFn.mockImplementation(() => {
      return new Error('There was an issue with the acl');
    });

    const { req, res } = createMocks({
      params: {
        email: 'dev_1@geolytix.co.uk',
        user: {
          admin: true,
        },
      },
    });

    await addUser(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Failed to access ACL.');
  });

  it('user already exists', async () => {
    aclMockFn.mockImplementation(() => {
      return ['user'];
    });

    const { req, res } = createMocks({
      params: {
        email: 'dev_1@geolytix.co.uk',
        user: {
          admin: true,
        },
      },
    });

    await addUser(req, res);

    expect(res._getData()).toEqual('User already exists in ACL.');
  });

  it('insert error', async () => {
    aclMockFn
      .mockImplementationOnce(() => [])
      .mockImplementationOnce(() => new Error());

    const { req, res } = createMocks({
      params: {
        email: 'dev_1@geolytix.co.uk',
        user: {
          admin: true,
        },
      },
    });

    await addUser(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Failed to add user account to ACL.');
  });
});
