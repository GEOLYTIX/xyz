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
    await codi.it(
      { name: 'req with authorization headers', parentId: 'user_auth' },
      async () => {
        const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

        fromACLFn.mock.mockImplementation(() => {
          return user;
        });

        const { default: auth } = await import('../../../mod/user/auth.js');

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

        const { default: auth } = await import('../../../mod/user/auth.js');

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

        const { default: auth } = await import('../../../mod/user/auth.js');

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

      const { default: auth } = await import('../../../mod/user/auth.js');

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

      codi.assertEqual(result, user);
    });

    await codi.it({ name: 'same secrets', parentId: 'user_auth' }, async () => {
      const user = { email: 'test@geolytix.co.uk', admin: true, roles: [] };

      const secret = 'i-am-a-secret';

      globalThis.xyzEnv = {
        SECRET: secret,
        TITLE: 'TEST',
      };

      const { default: auth } = await import('../../../mod/user/auth.js');

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

            const { default: auth } = await import('../../../mod/user/auth.js');

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

            const { default: auth } = await import('../../../mod/user/auth.js');

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

            const { default: auth } = await import('../../../mod/user/auth.js');

            const result = await auth(req, res);

            codi.assertTrue(result instanceof Error);
            codi.assertEqual(result.message, 'API Key mismatch');
          },
        );
      },
    );
  },
);

mockacl.restore();
mockFromACL.restore();
