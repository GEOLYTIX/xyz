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

const { readFileSync, readdirSync } = await import('fs');
const fsMockFn = vi.fn(readFileSync);
const fsMockDirFn = vi.fn(readdirSync);
vi.mock('fs', () => ({
  readFileSync: (...args) => fsMockFn(...args),
  readdirSync: (...args) => fsMockDirFn(...args),
}));

describe('auth:', async () => {
  const { default: auth } = await import('@geolytix/xyz-app/mod/user/auth.js');

  const privateKey = 'PRIVATEKEY';

  globalThis.xyzEnv ??= {};
  globalThis.xyzEnv.FILE_RESOURCES = 'public';
  globalThis.xyzEnv.KEY_FILE = 'TEST_KEY';
  globalThis.xyzEnv.WALLET = {
    TEST_KEY: 'PRIVATEKEY',
  };

  it('request with signature', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const signature = crypto
      .createHmac('sha256', privateKey)
      .update('./public/views/_login.html')
      .update('TEST_KEY')
      .update(String(Date.parse(date)))
      .digest('hex');

    const { req, res } = createMocks({
      params: {
        provider: 'file',
        signature: signature,
        url: './public/views/_login.html',
        expires: Date.parse(date),
        key_id: 'TEST_KEY',
      },
    });

    fsMockFn.mockImplementation((filePath) => {
      if (filePath?.includes?.('undefined')) {
        const error = new Error('File not Found');
        error.code = 'ENOENT';
        throw error;
      }
      return 'PRIVATEKEY';
    });

    fsMockDirFn.mockImplementation(() => {
      return ['TEST_KEY.pem'];
    });

    const result = await auth(req, res);

    expect(res.statusCode).toEqual(200);
    expect(result.signature_auth).toBeTruthy();
  });

  it('request with expired signature', async () => {
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update('./public/views/_login.html')
      .digest('hex');

    const date = new Date();
    date.setDate(date.getDate() - 1);

    const { req, res } = createMocks({
      params: {
        provider: 'file',
        signature: signature,
        url: './public/views/_login.html',
        expires: Date.parse(date),
        key_id: 'TEST_KEY',
      },
    });

    await auth(req, res);

    expect(res.statusCode).toEqual(401);
    expect(res._getData()).toEqual('Signature authentication failed');
  });

  it('request with invalid signature', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const { req, res } = createMocks({
      params: {
        provider: 'file',
        signature: 'bad',
        url: './public/views/_login.html',
        expires: Date.parse(date),
        key_id: 'TEST_KEY',
      },
    });

    await auth(req, res);

    expect(res.statusCode).toEqual(401);
    expect(res._getData()).toEqual('Signature authentication failed');
  });

  it('request with signature for different file', async () => {
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update('./public/views/_login.html')
      .digest('hex');

    const date = new Date();
    date.setDate(date.getDate() + 1);

    const { req, res } = createMocks({
      params: {
        provider: 'file',
        signature: signature,
        url: './public/views/_default.html',
        expires: Date.parse(date),
        key_id: 'TEST_KEY',
      },
    });

    await auth(req, res);

    expect(res.statusCode).toEqual(401);
    expect(res._getData()).toEqual('Signature authentication failed');
  });

  it('request with wrong key_id', async () => {
    const signature = crypto
      .createHmac('sha256', privateKey)
      .update('./public/views/_login.html')
      .digest('hex');

    const date = new Date();
    date.setDate(date.getDate() + 1);

    const { req, res } = createMocks({
      params: {
        provider: 'file',
        signature: signature,
        url: './public/views/_default.html',
        expires: Date.parse(date),
        key_id: 'TES_KEY',
      },
    });

    await auth(req, res);

    expect(res.statusCode).toEqual(405);
    expect(res._getData()).toEqual('Signature authentication not configured');
  });

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
      expect(result.message).toEqual('API Key mismatch');
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
        TITLE: 'TEST',
      };

      aclFn.mockImplementation(() => {
        return [user];
      });

      const result = await auth(req, res);

      expect(result.email).toEqual('test@geolytix.co.uk');
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
