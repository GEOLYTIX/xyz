import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

// Mock the acl module.
const aclFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

describe('log:', async () => {
  const { default: accessLog } = await import('@geolytix/xyz-app/mod/user/log.js');

  it('Returns an error if no email parameter provided ', async () => {
    const { req, res } = createMocks({
      params: {},
    });

    await accessLog(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Missing email param');
  });

  it('Returns an error if email parameter provided but no user ', async () => {
    const { req, res } = createMocks({
      params: {
        email: 'test@geolytix.co.uk',
      },
    });

    const result = await accessLog(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('login_required');
  });

  it('Returns an error if email parameter not yourself, and user is not an admin ', async () => {
    const { req, res } = createMocks({
      params: {
        email: 'test@geolytix.co.uk',
        user: {
          email: 'test1@geolytix.co.uk',
          admin: false,
        },
      },
    });

    const result = await accessLog(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('admin_required');
  });

  it('Returns logs if email parameter is yourself ', async () => {
    aclFn.mockImplementation(() => {
      return [{ access_log: 'test' }];
    });

    const { req, res } = createMocks({
      params: {
        email: 'test@geolytix.co.uk',
        user: {
          email: 'test@geolytix.co.uk',
          admin: false,
        },
      },
    });

    await accessLog(req, res);

    expect(res._getData()).toEqual({ access_log: 'test' });

    aclFn.mockImplementation(() => {
      return [{ access_log: 'test' }, { access_log: 'test' }];
    });

    await accessLog(req, res);
    expect(res._getData()).toEqual([
      { access_log: 'test' },
      { access_log: 'test' },
    ]);
  });

  it('Returns logs if email parameter is someone else, and user is an admin ', async () => {
    aclFn.mockImplementation(() => {
      return [{ access_log: 'test' }];
    });

    const { req, res } = createMocks({
      params: {
        email: 'test1@geolytix.co.uk',
        user: {
          email: 'test@geolytix.co.uk',
          admin: true,
        },
      },
    });

    await accessLog(req, res);

    expect(res._getData()).toEqual({ access_log: 'test' });

    aclFn.mockImplementation(() => {
      return [{ access_log: 'test' }, { access_log: 'test' }];
    });

    await accessLog(req, res);
    expect(res._getData()).toEqual([
      { access_log: 'test' },
      { access_log: 'test' },
    ]);
  });

  it('Returns error if an error occurs in the acl module ', async () => {
    aclFn.mockImplementation(() => {
      return new Error('failed to access ACL');
    });

    const { req, res } = createMocks({
      params: {
        email: 'test1@geolytix.co.uk',
        user: {
          email: 'test@geolytix.co.uk',
          admin: true,
        },
      },
    });

    await accessLog(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Failed to access ACL.');
  });

  it('Returns 204 if no rows are returned from the acl module ', async () => {
    aclFn.mockImplementation(() => {
      return [];
    });

    const { req, res } = createMocks({
      params: {
        email: 'test1@geolytix.co.uk',
        user: {
          email: 'test@geolytix.co.uk',
          admin: true,
        },
      },
    });

    await accessLog(req, res);

    expect(res.statusCode).toEqual(204);
    expect(res._getData()).toEqual('No rows returned from table.');
  });
});
