import jwt from 'jsonwebtoken';

const secret = crypto.randomUUID();

globalThis.xyzEnv.SECRET = secret;

const aclFn = codi.mock.fn();
const mockacl = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclFn,
  // namedExport: {
  //   acl: aclFn,
  // },
});

// const fromACLFn = codi.mock.fn();
// const mockFromACL = codi.mock.module('../../../mod/user/fromACL.js', {
//   defaultExport: fromACLFn,
// });

await codi.describe(
  { name: 'token:', id: 'user_token', parentId: 'user' },
  async () => {
    await codi.it({ name: 'no user', parentId: 'user_token' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {},
      });

      const { default: userToken } = await import('../../../mod/user/token.js');

      const response = await userToken(req, res);

      codi.assertTrue(
        response instanceof Error && response.message === 'login_required',
      );
    });

    let token;

    await codi.it({ name: 'admin user', parentId: 'user_token' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          expiresin: '10hr',
          user: {
            api: true,
            email: 'test@geolytix.co.uk',
            roles: [],
            admin: true,
          },
        },
      });

      const { default: userToken } = await import('../../../mod/user/token.js');

      await userToken(req, res);

      token = res._getData();

      const user = jwt.verify(token, xyzEnv.SECRET);

      // token expires in 10hr.
      codi.assertTrue(user.exp - user.iat === 36000);

      // user from token must not have admin rights.
      codi.assertTrue(!user.admin);
    });

    let user;
    await codi.it({ name: 'token auth', parentId: 'user_token' }, async () => {
      console.log(token);

      aclFn.mock.mockImplementation(() => {
        const rows = [
          {
            email: 'test@geolytix.co.uk',
            api: token,
          },
        ];

        return rows;
      });

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          token,
        },
      });

      const { default: auth } = await import('../../../mod/user/auth.js');

      // auth should return user from token.
      user = await auth(req, res);

      console.log(user);

      codi.assertTrue(user.from_token);
    });

    await codi.it({ name: 'token user', parentId: 'user_token' }, async () => {
      //const user = jwt.verify(token, xyzEnv.SECRET);

      //TODO: get user from login with token.

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user,
        },
      });

      const { default: userToken } = await import('../../../mod/user/token.js');

      const response = await userToken(req, res);

      codi.assertTrue(
        response instanceof Error &&
          response.message ===
            'Token may not be generated from token authentication.',
      );
    });
  },
);

mockacl.restore();
//mockFromACL.restore();
