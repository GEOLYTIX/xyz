import jwt from 'jsonwebtoken';

const secret = crypto.randomUUID();

globalThis.xyzEnv.SECRET = secret;
globalThis.xyzEnv.SECRET_ALGORITHM = 'HS256';

await codi.describe(
  { name: 'token:', id: 'user_token', parentId: 'user' },
  async () => {
    const { default: userToken } = await import('../../../mod/user/token.js');

    const { default: auth } = await import('../../../mod/user/auth.js');

    let token;

    let user = {
      email: 'test@geolytix.co.uk',
      roles: [],
      admin: true,
    };

    // The /user/token module should return an error if no user object is provided as request param.
    await codi.it(
      { name: 'missing user param', parentId: 'user_token' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {},
        });

        const response = await userToken(req, res);

        codi.assertTrue(
          response instanceof Error && response.message === 'login_required',
        );
      },
    );

    // The /user/token module should return a token for the provided user object request param.
    await codi.it(
      { name: '10hr admin user token', parentId: 'user_token' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            expiresin: '10hr',
            user,
          },
        });

        await userToken(req, res);

        token = res._getData();

        user = jwt.verify(token, xyzEnv.SECRET);

        // token expires in 10hr.
        codi.assertTrue(user.exp - user.iat === 36000);

        // user from token must not have admin rights.
        codi.assertTrue(!user.admin);
      },
    );

    // The /user/auth module should return the token user object without admin flag but with the from_token flag.
    await codi.it({ name: 'token auth', parentId: 'user_token' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          token,
        },
      });

      // auth should return user from token.
      user = await auth(req, res);

      codi.assertTrue(user.from_token);
    });

    // The user object from token authentication may not be used to create a new token.
    await codi.it({ name: 'token user', parentId: 'user_token' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user,
        },
      });

      const response = await userToken(req, res);

      codi.assertTrue(
        response instanceof Error &&
          response.message ===
            'Token may not be generated from token authentication.',
      );
    });
  },
);
