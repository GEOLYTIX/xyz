import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const aclFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclFn(...args),
  acl: (...args) => aclFn(...args),
}));

const fromACLFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/user/fromACL.js', () => ({
  default: (...args) => fromACLFn(...args),
}));

const { readFileSync, readdirSync } = await import('node:fs');
const fsMockFn = vi.fn(readFileSync);
const fsMockDirFn = vi.fn(readdirSync);
vi.mock('fs', () => ({
  readFileSync: (...args) => fsMockFn(...args),
  readdirSync: (...args) => fsMockDirFn(...args),
}));

describe('auth:', async () => {
  const { default: auth } = await import('@geolytix/xyz-app/mod/user/auth.js');

  globalThis.xyzEnv ??= {};
  globalThis.xyzEnv.FILE_RESOURCES = 'public';
  globalThis.xyzEnv.KEY_FILE = 'TEST_KEY';
  globalThis.xyzEnv.WALLET = {
    TEST_KEY: 'PRIVATEKEY',
  };

  it('req with authorization headers', async () => {
    const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

    fromACLFn.mockImplementation(() => {
      return user;
    });

    const { req, res } = createMocks({
      headers: {
        authorization: true,
      },
    });

    const result = await auth(req, res);

    expect(result).toEqual(user);
  });

  it('no secret defined', async () => {
    const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

    const secret = 'i-am-a-secret';

    const { req, res } = createMocks({
      headers: {},
      params: {
        token: jwt.sign(JSON.stringify(user), secret),
      },
    });

    const result = await auth(req, res);

    expect(result).toEqual(null);
  });

  it('different secrets', async () => {
    const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

    const secret = 'i-am-a-secret';

    globalThis.xyzEnv = {
      SECRET: secret,
    };

    const { req, res } = createMocks({
      headers: {},
      params: {
        token: jwt.sign(JSON.stringify(user), 'i-am-different'),
      },
    });

    const result = await auth(req, res);

    expect(result.name).toEqual('JsonWebTokenError');
  });

  it('same secrets', async () => {
    const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

    const secret = 'i-am-a-secret';

    globalThis.xyzEnv = {
      SECRET: secret,
      TITLE: 'TEST',
    };

    const { req, res } = createMocks({
      headers: {
        host: 'http://localhost:3000',
      },
      cookies: {
        TEST: jwt.sign(JSON.stringify(user), secret),
      },
      params: {},
    });

    const result = await auth(req, res);

    // Add * role for equality check
    user.roles = ['*'];

    expect(result).toEqual(user);
  });

  it('same secrets', async () => {
    const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

    const secret = 'i-am-a-secret';

    globalThis.xyzEnv = {
      SECRET: secret,
      TITLE: 'TEST',
    };

    const { req, res } = createMocks({
      headers: {
        host: 'http://localhost:3000',
      },
      cookies: {
        TEST: jwt.sign(JSON.stringify(user), secret),
      },
      params: {},
    });

    const result = await auth(req, res);

    // Add * role for equality check
    user.roles = ['*'];

    expect(result).toEqual(user);
  });

  describe('checkParamToken: ', async () => {
    it('user api present w/error from acl', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
        api: true,
      };

      aclFn.mockImplementation(() => {
        return new Error("This is bad and it's happening");
      });

      const secret = 'i-am-a-secret';

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
      };

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        params: {
          token: jwt.sign(JSON.stringify(user), secret),
        },
      });

      const result = await auth(req, res);

      expect(result instanceof Error).toBeTruthy();
    });

    it('user blocked', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
        api: true,
      };

      aclFn.mockImplementation(() => {
        return { blocked: true };
      });

      const secret = 'i-am-a-secret';

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
      };

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        params: {
          token: jwt.sign(JSON.stringify(user), secret),
        },
      });

      const result = await auth(req, res);

      expect(result instanceof Error).toBeTruthy();
    });

    it('api token mismatch', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
        api: true,
      };

      const secret = 'i-am-a-secret';

      const token = jwt.sign(JSON.stringify(user), secret);
      user.api = token;

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        params: {
          token: token,
        },
      });

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
      };

      aclFn.mockImplementation(() => {
        user.api = jwt.sign(JSON.stringify(user), secret);
        return [user];
      });

      const result = await auth(req, res);

      expect(result instanceof Error).toBeTruthy();
      expect(result.message).toEqual('API Key mismatch.');
    });

    it('api token correct', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
        api: true,
      };

      const secret = 'i-am-a-secret';

      const token = jwt.sign(JSON.stringify(user), secret);
      user.api = token;

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        params: {
          token: token,
        },
      });

      globalThis.xyzEnv = {
        SECRET: secret,
        SECRET_ALGORITHM: 'HS256',
        SESSION_TYP: 'session',
        SESSION_ISS: 'xyz',
        SESSION_AUD: 'xyz',
        TITLE: 'TEST',
      };

      aclFn.mockImplementation(() => {
        return [user];
      });

      const result = await auth(req, res);

      expect(result.email).toEqual('test@geolytix.co.uk');
    });

    it('the re-issued browser cookie carries the session claims', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
        api: true,
      };

      const secret = 'i-am-a-secret';

      const token = jwt.sign(JSON.stringify(user), secret);
      user.api = token;

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        params: {
          token: token,
        },
      });

      globalThis.xyzEnv = {
        SECRET: secret,
        SECRET_ALGORITHM: 'HS256',
        SESSION_TYP: 'session',
        SESSION_ISS: 'xyz',
        SESSION_AUD: 'xyz',
        TITLE: 'TEST',
      };

      aclFn.mockImplementation(() => {
        return [user];
      });

      await auth(req, res);

      const header = res.getHeader('Set-Cookie');
      const cookieToken = header.match(/^TEST=([^;]+)/)[1];

      expect(jwt.decode(cookieToken)).toMatchObject({
        typ: 'session',
        iss: 'xyz',
        aud: ['xyz'],
      });
    });
  });

  describe('checkSession:', async () => {
    it('no user session', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
      };

      const secret = 'i-am-a-secret';

      const token = jwt.sign(JSON.stringify(user), secret);

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
        USER_SESSION: true,
      };

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        cookies: {
          TEST: token,
        },
        params: {},
      });

      aclFn.mockImplementation(() => {
        return [user];
      });

      const result = await auth(req, res);

      expect(result instanceof Error).toBeTruthy();
      expect(result.message).toEqual('No user.session provided.');
    });

    it('user with a session', async () => {
      const user = {
        email: 'test@geolytix.co.uk',
        admin: true,
        roles: [],
        session: crypto.randomUUID(),
      };

      const secret = 'i-am-a-secret';

      const token = jwt.sign(JSON.stringify(user), secret);

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
        USER_SESSION: true,
      };

      const { req, res } = createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        cookies: {
          TEST: token,
        },
        params: {},
      });

      aclFn.mockImplementation(() => {
        return [user];
      });

      const result = await auth(req, res);

      expect(result.session).toEqual(user.session);
    });
  });
});
