import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const aclFn = vi.fn();
vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

globalThis.xyzEnv = {
  TITLE: 'TEST',
  COOKIE_TTL: 36000,
  TRANSPORT_EMAIL: 'xyz@gmail.com',
  TRANSPORT_PASSWORD: 'IAMANEMAILPASSWORD',
  SECRET_ALGORITHM: 'HS256',
};

describe('cookie:', async () => {
  const { default: cookie } = await import('../../../mod/user/cookie.js');
  it('no cookie', async () => {
    const { req, res } = createMocks({
      cookies: {},
      params: {},
    });

    await cookie(req, res);

    expect(res._getData()).toEqual('false');
  });

  it('destroy cookie', async () => {
    const expHeader = {
      'set-cookie': 'TEST=null;HttpOnly;Max-Age=0;Path=/',
    };

    const user = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
    };

    const secret = crypto.randomUUID();

    globalThis.xyzEnv.SECRET = secret;

    const { req, res } = createMocks({
      cookies: {
        TEST: jwt.sign(user, secret),
      },
      params: {
        destroy: true,
      },
    });

    await cookie(req, res);

    const message = res._getData();
    const headers = res.getHeaders();

    expect(message).toEqual('This too shall pass');
    expect(headers).toEqual(expHeader);
  });

  it('set cookie', async () => {
    const user = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
    };

    const expUser = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
      title: 'TEST',
    };

    const secret = crypto.randomUUID();

    globalThis.xyzEnv.SECRET = secret;

    const { req, res } = createMocks({
      headers: {
        host: 'http://localhost:3000',
      },
      cookies: {
        TEST: jwt.sign(user, secret),
      },
      params: {},
    });

    aclFn.mockImplementation(() => {
      return [user];
    });

    await cookie(req, res);

    const header = res.getHeader('set-cookie');
    const resUser = res._getData();

    expect(header !== null).toBeTruthy();
    expect(resUser).toEqual(expUser);
  });

  it('acl error', async () => {
    const user = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
    };

    const expUser = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
      title: 'TEST',
    };

    const secret = crypto.randomUUID();

    globalThis.xyzEnv.SECRET = secret;

    const { req, res } = createMocks({
      headers: {
        host: 'http://localhost:3000',
      },
      cookies: {
        TEST: jwt.sign(user, secret),
      },
      params: {},
    });

    aclFn.mockImplementation(() => {
      return new Error('I am not here and this is not happening');
    });

    await cookie(req, res);

    const message = res._getData();
    const status = res.statusCode;

    expect(message).toEqual('Failed to retrieve user from ACL');
    expect(status).toEqual(500);
  });

  it('blocked user', async () => {
    const user = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
    };

    const expUser = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
      title: 'TEST',
    };

    const secret = crypto.randomUUID();

    globalThis.xyzEnv.SECRET = secret;

    const { req, res } = createMocks({
      headers: {
        host: 'http://localhost:3000',
      },
      cookies: {
        TEST: jwt.sign(user, secret),
      },
      params: {},
    });

    aclFn.mockImplementation(() => {
      user.blocked = true;
      return [user];
    });

    await cookie(req, res);

    const message = res._getData();
    const status = res.statusCode;

    expect(message).toEqual('Account is blocked');
    expect(status).toEqual(403);
  });

  it('saml user', async () => {
    const user = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
    };

    const samlUser = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: false,
      sessionIndex: crypto.randomUUID(),
    };

    const secret = crypto.randomUUID();

    globalThis.xyzEnv.SECRET = secret;

    const { req, res } = createMocks({
      headers: {
        host: 'http://localhost:3000',
      },
      cookies: {
        TEST: jwt.sign(samlUser, secret),
      },
      params: {},
    });

    aclFn.mockImplementation(() => {
      return [user];
    });

    await cookie(req, res);

    const header = res.getHeader('set-cookie');
    let token = {};

    //Split the values from the header
    header.split(';').forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');

      if (name === 'TEST') {
        token = jwt.decode(value);
      }
    });

    expect(Object.hasOwn(token, 'sessionIndex')).toBeTruthy();
  });
});
