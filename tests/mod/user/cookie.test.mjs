import jwt from 'jsonwebtoken';

const aclFn = codi.mock.fn();
const mockACL = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclFn,
});

globalThis.xyzEnv = {
  TITLE: 'TEST',
  COOKIE_TTL: 36000,
  TRANSPORT_EMAIL: 'xyz@gmail.com',
  TRANSPORT_PASSWORD: 'IAMANEMAILPASSWORD',
  TRANSPORT_HOST: 'smpt-host.emailserver.com',
  SECRET_ALGORITHM: 'HS256',
};

await codi.describe(
  { name: 'cookie:', id: 'user_cookie', parentId: 'user' },
  async () => {
    const { default: cookie } = await import('../../../mod/user/cookie.js');
    await codi.it({ name: 'no cookie', parentId: 'user_cookie' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        cookies: {},
        params: {},
      });

      await cookie(req, res);

      codi.assertEqual(res._getData(), 'false');
    });

    await codi.it(
      { name: 'destroy cookie', parentId: 'user_cookie' },
      async () => {
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

        const { req, res } = codi.mockHttp.createMocks({
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

        codi.assertEqual(message, 'This too shall pass');
        codi.assertEqual(headers, expHeader);
      },
    );

    await codi.it({ name: 'set cookie', parentId: 'user_cookie' }, async () => {
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

      const { req, res } = codi.mockHttp.createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        cookies: {
          TEST: jwt.sign(user, secret),
        },
        params: {},
      });

      aclFn.mock.mockImplementation(() => {
        return [user];
      });

      await cookie(req, res);

      const header = res.getHeader('set-cookie');
      const resUser = res._getData();

      codi.assertTrue(header !== null);
      codi.assertEqual(resUser, expUser);
    });

    await codi.it({ name: 'acl error', parentId: 'user_cookie' }, async () => {
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

      const { req, res } = codi.mockHttp.createMocks({
        headers: {
          host: 'http://localhost:3000',
        },
        cookies: {
          TEST: jwt.sign(user, secret),
        },
        params: {},
      });

      aclFn.mock.mockImplementation(() => {
        return new Error('I am not here and this is not happening');
      });

      await cookie(req, res);

      const message = res._getData();
      const status = res.statusCode;

      codi.assertEqual(message, 'Failed to retrieve user from ACL');
      codi.assertEqual(status, 500);
    });

    await codi.it(
      { name: 'blocked user', parentId: 'user_cookie' },
      async () => {
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

        const { req, res } = codi.mockHttp.createMocks({
          headers: {
            host: 'http://localhost:3000',
          },
          cookies: {
            TEST: jwt.sign(user, secret),
          },
          params: {},
        });

        aclFn.mock.mockImplementation(() => {
          user.blocked = true;
          return [user];
        });

        await cookie(req, res);

        const message = res._getData();
        const status = res.statusCode;

        codi.assertEqual(message, 'Account is blocked');
        codi.assertEqual(status, 403);
      },
    );
  },
);

mockACL.restore();
