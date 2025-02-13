import jwt from 'jsonwebtoken';

const secret = crypto.randomUUID();

globalThis.xyzEnv.SECRET = secret;

await codi.describe(
  { name: 'token:', id: 'user_token', parentId: 'user' },
  async () => {
    await codi.it(
      { name: 'TEST ME! @dbauszus-glx', parentId: 'user_token' },
      () => {
        //TODO: @dbauszus-glx Please test me
        codi.assertTrue(false);
      },
    );

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

    await codi.it({ name: 'admin user', parentId: 'user_token' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user: {
            email: 'test@geolytix.co.uk',
            roles: [],
            admin: true,
          },
        },
      });

      const { default: userToken } = await import('../../../mod/user/token.js');

      await userToken(req, res);

      const token = res._getData();

      const user = jwt.verify(token, xyzEnv.SECRET);

      // token expires in 8hr.
      codi.assertTrue(user.exp - user.iat === 28800);
    });
  },
);
