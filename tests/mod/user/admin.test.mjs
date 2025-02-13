await codi.describe(
  { name: 'admin: ', id: 'user_admin', parentId: 'user' },
  async () => {
    const { default: admin } = await import('../../../mod/user/admin.js');
    await codi.it(
      { name: 'no user provided', parentId: 'user_admin' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks();

        const result = await admin(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'login_required');
      },
    );

    await codi.it(
      { name: 'not an admin user', parentId: 'user_admin' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user: {},
          },
        });

        const result = await admin(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'admin_required');
      },
    );
  },
);
