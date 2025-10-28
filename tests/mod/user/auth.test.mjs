import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';

const aclFn = codi.mock.fn();
const mockacl = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclFn,
  namedExport: {
    acl: aclFn,
  },
});

const fromACLFn = codi.mock.fn();
const mockFromACL = codi.mock.module('../../../mod/user/fromACL.js', {
  defaultExport: fromACLFn,
});

const { readFileSync, readdirSync } = await import('fs');
const fsMockFn = codi.mock.fn(readFileSync);
const fsMockDirFn = codi.mock.fn(readdirSync);
const fsMock = codi.mock.module('fs', {
  namedExports: {
    readFileSync: fsMockFn,
    readdirSync: fsMockDirFn,
  },
});

await codi.describe(
  { name: 'auth:', id: 'user_auth', parentId: 'user' },
  async () => {
    const { default: auth } = await import('../../../mod/user/auth.js');

    const privateKey = 'PRIVATEKEY';

    globalThis.xyzEnv ??= {};
    globalThis.xyzEnv.FILE_RESOURCES = 'public';
    globalThis.xyzEnv.KEY_FILE = 'TEST_KEY';
    globalThis.xyzEnv.WALLET = {
      TEST_KEY: 'PRIVATEKEY',
    };

    await codi.it(
      { name: 'request with signature', parentId: 'user_auth' },
      async () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);

        const signature = crypto
          .createHmac('sha256', privateKey)
          .update('./public/views/_login.html')
          .update('TEST_KEY')
          .update(String(Date.parse(date)))
          .digest('hex');

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            provider: 'file',
            signature: signature,
            url: './public/views/_login.html',
            expires: Date.parse(date),
            key_id: 'TEST_KEY',
          },
        });

        fsMockFn.mock.mockImplementation((filePath) => {
          if (filePath?.includes?.('undefined')) {
            const error = new Error('File not Found');
            error.code = 'ENOENT';
            throw error;
          }
          return 'PRIVATEKEY';
        });

        fsMockDirFn.mock.mockImplementation(() => {
          return ['TEST_KEY.pem'];
        });

        const result = await auth(req, res);

        codi.assertEqual(res.statusCode, 200);
        codi.assertTrue(result.signature_auth);
      },
    );
    await codi.it(
      { name: 'request with expired signature', parentId: 'user_auth' },
      async () => {
        const signature = crypto
          .createHmac('sha256', privateKey)
          .update('./public/views/_login.html')
          .digest('hex');

        const date = new Date();
        date.setDate(date.getDate() - 1);

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            provider: 'file',
            signature: signature,
            url: './public/views/_login.html',
            expires: Date.parse(date),
            key_id: 'TEST_KEY',
          },
        });

        await auth(req, res);

        codi.assertEqual(res.statusCode, 401);
        codi.assertEqual(res._getData(), 'Signature authentication failed');
      },
    );
    await codi.it(
      { name: 'request with invalid signature', parentId: 'user_auth' },
      async () => {
        const date = new Date();
        date.setDate(date.getDate() + 1);

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            provider: 'file',
            signature: 'bad',
            url: './public/views/_login.html',
            expires: Date.parse(date),
            key_id: 'TEST_KEY',
          },
        });

        await auth(req, res);

        codi.assertEqual(res.statusCode, 401);
        codi.assertEqual(res._getData(), 'Signature authentication failed');
      },
    );
    await codi.it(
      {
        name: 'request with signature for different file',
        parentId: 'user_auth',
      },
      async () => {
        const signature = crypto
          .createHmac('sha256', privateKey)
          .update('./public/views/_login.html')
          .digest('hex');

        const date = new Date();
        date.setDate(date.getDate() + 1);

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            provider: 'file',
            signature: signature,
            url: './public/views/_default.html',
            expires: Date.parse(date),
            key_id: 'TEST_KEY',
          },
        });

        await auth(req, res);

        codi.assertEqual(res.statusCode, 401);
        codi.assertEqual(res._getData(), 'Signature authentication failed');
      },
    );
    await codi.it(
      {
        name: 'request with wrong key_id',
        parentId: 'user_auth',
      },
      async () => {
        const signature = crypto
          .createHmac('sha256', privateKey)
          .update('./public/views/_login.html')
          .digest('hex');

        const date = new Date();
        date.setDate(date.getDate() + 1);

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            provider: 'file',
            signature: signature,
            url: './public/views/_default.html',
            expires: Date.parse(date),
            key_id: 'TES_KEY',
          },
        });

        fsMock.restore();

        await auth(req, res);

        codi.assertEqual(res.statusCode, 405);
        codi.assertEqual(
          res._getData(),
          'Signature authentication not configured',
        );
      },
    );
    await codi.it(
      { name: 'req with authorization headers', parentId: 'user_auth' },
      async () => {
        const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

        fromACLFn.mock.mockImplementation(() => {
          return user;
        });

        const { req, res } = codi.mockHttp.createMocks({
          headers: {
            authorization: true,
          },
        });

        const result = await auth(req, res);

        codi.assertEqual(result, user);
      },
    );

    await codi.it(
      { name: 'no secret defined', parentId: 'user_auth' },
      async () => {
        const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

        const secret = 'i-am-a-secret';

        const { req, res } = codi.mockHttp.createMocks({
          headers: {},
          params: {
            token: jwt.sign(JSON.stringify(user), secret),
          },
        });

        const result = await auth(req, res);

        codi.assertEqual(result, null);
      },
    );

    await codi.it(
      { name: 'different secrets', parentId: 'user_auth' },
      async () => {
        const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

        const secret = 'i-am-a-secret';

        globalThis.xyzEnv = {
          SECRET: secret,
        };

        const { req, res } = codi.mockHttp.createMocks({
          headers: {},
          params: {
            token: jwt.sign(JSON.stringify(user), 'i-am-different'),
          },
        });

        const result = await auth(req, res);

        codi.assertEqual(result.name, 'JsonWebTokenError');
      },
    );

    await codi.it({ name: 'same secrets', parentId: 'user_auth' }, async () => {
      const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

      const secret = 'i-am-a-secret';

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
      };

      const { req, res } = codi.mockHttp.createMocks({
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

      codi.assertEqual(result, user);
    });

    await codi.it({ name: 'same secrets', parentId: 'user_auth' }, async () => {
      const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

      const secret = 'i-am-a-secret';

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
      };

      const { req, res } = codi.mockHttp.createMocks({
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

      codi.assertEqual(result, user);
    });

    await codi.describe(
      {
        name: 'checkParamToken: ',
        id: 'user_auth_check_token',
        parentId: 'user_auth',
      },
      async () => {
        await codi.it(
          {
            name: 'user api present w/error from acl',
            parentId: 'user_auth_check_token',
          },
          async () => {
            const user = {
              email: 'test@geolytix.co.uk',
              admin: true,
              roles: [],
              api: true,
            };

            aclFn.mock.mockImplementation(() => {
              return new Error("This is bad and it's happening");
            });

            const secret = 'i-am-a-secret';

            globalThis.xyzEnv = {
              SECRET: secret,
              TITLE: 'TEST',
            };

            const { req, res } = codi.mockHttp.createMocks({
              headers: {
                host: 'http://localhost:3000',
              },
              params: {
                token: jwt.sign(JSON.stringify(user), secret),
              },
            });

            const result = await auth(req, res);

            codi.assertTrue(result instanceof Error);
          },
        );

        await codi.it(
          {
            name: 'user blocked',
            parentId: 'user_auth_check_token',
          },
          async () => {
            const user = {
              email: 'test@geolytix.co.uk',
              admin: true,
              roles: [],
              api: true,
            };

            aclFn.mock.mockImplementation(() => {
              return { blocked: true };
            });

            const secret = 'i-am-a-secret';

            globalThis.xyzEnv = {
              SECRET: secret,
              TITLE: 'TEST',
            };

            const { req, res } = codi.mockHttp.createMocks({
              headers: {
                host: 'http://localhost:3000',
              },
              params: {
                token: jwt.sign(JSON.stringify(user), secret),
              },
            });

            const result = await auth(req, res);

            codi.assertTrue(result instanceof Error);
          },
        );

        await codi.it(
          {
            name: 'api token mismatch',
            parentId: 'user_auth_check_token',
          },
          async () => {
            const user = {
              email: 'test@geolytix.co.uk',
              admin: true,
              roles: [],
              api: true,
            };

            const secret = 'i-am-a-secret';

            const token = jwt.sign(JSON.stringify(user), secret);
            user.api = token;

            const { req, res } = codi.mockHttp.createMocks({
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

            aclFn.mock.mockImplementation(() => {
              user.api = jwt.sign(JSON.stringify(user), secret);
              return [user];
            });

            const result = await auth(req, res);

            codi.assertTrue(result instanceof Error);
            codi.assertEqual(result.message, 'API Key mismatch');
          },
        );

        await codi.it(
          {
            name: 'api token correct',
            parentId: 'user_auth_check_token',
          },
          async () => {
            const user = {
              email: 'test@geolytix.co.uk',
              admin: true,
              roles: [],
              api: true,
            };

            const secret = 'i-am-a-secret';

            const token = jwt.sign(JSON.stringify(user), secret);
            user.api = token;

            const { req, res } = codi.mockHttp.createMocks({
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

            aclFn.mock.mockImplementation(() => {
              return [user];
            });

            const result = await auth(req, res);

            codi.assertEqual(result.email, 'test@geolytix.co.uk');
          },
        );
      },
    );

    await codi.describe(
      {
        name: 'checkSession:',
        id: 'user_auth_check_session',
        parentId: 'user_auth',
      },
      async () => {
        await codi.it(
          { name: 'no user session', parentId: 'user_auth_check_session' },
          async () => {
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

            const { req, res } = codi.mockHttp.createMocks({
              headers: {
                host: 'http://localhost:3000',
              },
              cookies: {
                TEST: token,
              },
              params: {},
            });

            aclFn.mock.mockImplementation(() => {
              return [user];
            });

            const result = await auth(req, res);

            codi.assertTrue(result instanceof Error);
            codi.assertEqual(result.message, 'No user.session provided.');
          },
        );

        await codi.it(
          { name: 'user with a session', parentId: 'user_auth_check_session' },
          async () => {
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

            const { req, res } = codi.mockHttp.createMocks({
              headers: {
                host: 'http://localhost:3000',
              },
              cookies: {
                TEST: token,
              },
              params: {},
            });

            aclFn.mock.mockImplementation(() => {
              return [user];
            });

            const result = await auth(req, res);

            codi.assertEqual(result.session, user.session);
          },
        );
      },
    );
  },
);

fsMock.restore();
mockacl.restore();
mockFromACL.restore();
