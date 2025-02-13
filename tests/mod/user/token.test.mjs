import jwt from 'jsonwebtoken';

const secret = crypto.randomUUID();

globalThis.xyzEnv.SECRET = secret;

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

    await codi.it({ name: 'token user', parentId: 'user_token' }, async () => {
      const user = jwt.verify(token, xyzEnv.SECRET);

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
