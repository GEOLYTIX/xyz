import { createMocks } from 'node-mocks-http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const aclfn = vi.fn();
vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => aclfn(...args),
}));

const mailerfn = vi.fn();
vi.mock('../../../mod/utils/resend.js', () => ({
  default: { send: (...args) => mailerfn(...args) },
}));

let originalLog;
const mockLogs = [];

beforeAll(() => {
  originalLog = console.log;
  console.log = (log) => {
    mockLogs.push(log);
  };
});

afterAll(() => {
  console.log = originalLog;
});

describe('delete:', () => {
  beforeAll(() => {
    globalThis.xyzEnv = {
      TITLE: 'TEST',
    };
  });

  it('no email provided', async () => {
    const { default: deleteUser } = await import('../../../mod/user/delete.js');
    const { req, res } = createMocks({
      params: {},
    });

    await deleteUser(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Missing email param');
  });

  it('no user provided', async () => {
    const { default: deleteUser } = await import('../../../mod/user/delete.js');
    const { req, res } = createMocks({
      params: {
        email: 'test@geolytix.co.uk',
      },
    });

    const result = await deleteUser(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('login_required');
  });

  it('delete user', async () => {
    const { default: deleteUser } = await import('../../../mod/user/delete.js');
    const user = {
      email: 'test@geolytix.co.uk',
    };

    aclfn.mockImplementation(() => {
      return [user];
    });

    const { req, res } = createMocks({
      params: {
        email: user.email,
        user: {
          email: 'admin@geolytix.co.uk',
          admin: true,
        },
      },
    });

    await deleteUser(req, res);

    expect(res._getData()).toEqual('User account deleted.');
  });

  it('acl error', async () => {
    const user = {
      email: 'test@geolytix.co.uk',
    };

    aclfn.mockImplementation(() => {
      return new Error('Something bad happened');
    });

    const { default: deleteUser } = await import('../../../mod/user/delete.js');

    const { req, res } = createMocks({
      params: {
        email: user.email,
        user: {
          email: 'admin@geolytix.co.uk',
          admin: true,
        },
      },
    });

    await deleteUser(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('Failed to access ACL.');
  });

  it('user deleting themselves', async () => {
    const { default: deleteUser } = await import('../../../mod/user/delete.js');
    const user = {
      email: 'admin@geolytix.co.uk',
    };

    aclfn.mockImplementation(() => {
      return [user];
    });

    const { req, res } = createMocks({
      params: {
        email: user.email,
        user: {
          email: 'admin@geolytix.co.uk',
          admin: true,
        },
      },
    });

    await deleteUser(req, res);

    const header = res.getHeader('set-cookie');

    expect(res.statusCode).toEqual(200);
    expect(header !== null).toBeTruthy();
    expect(res._getData()).toEqual('User account deleted.');
  });

  it('user deleting themselves(not admin)', async () => {
    const { default: deleteUser } = await import('../../../mod/user/delete.js');
    const user = {
      email: 'admin@geolytix.co.uk',
    };

    aclfn.mockImplementation(() => {
      return [user];
    });

    const { req, res } = createMocks({
      params: {
        email: user.email,
        user: {
          email: 'admin@geolytix.co.uk',
        },
      },
    });

    await deleteUser(req, res);

    const header = res.getHeader('set-cookie');

    expect(res.statusCode).toEqual(200);
    expect(header !== null).toBeTruthy();
    expect(res._getData()).toEqual('User account deleted.');
  });
});
