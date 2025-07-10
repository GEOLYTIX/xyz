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

await codi.describe(
  { name: 'auth:', id: 'user_auth', parentId: 'user' },
  async () => {
    const { default: auth } = await import('../../../mod/user/auth.js');
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
              session: crypto.randomUUID('123.12.23/123'),
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

mockacl.restore();
mockFromACL.restore();
