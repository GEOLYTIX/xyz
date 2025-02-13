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
  },
);
