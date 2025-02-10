await codi.describe({ name: 'User Admin', id: 'admin' }, async () => {
  await codi.it({ name: 'no user provided', parentId: 'admin' }, async () => {
    const { default: admin } = await import('../../../mod/user/admin.js');

    const { req, res } = codi.mockHttp.createMocks();

    const result = await admin(req, res);

    codi.assertTrue(result instanceof Error);
    codi.assertEqual(result.message, 'login_required');
  });

  await codi.it({ name: 'not an admin user', parentId: 'admin' }, async () => {
    const { default: admin } = await import('../../../mod/user/admin.js');

    const { req, res } = codi.mockHttp.createMocks({
      params: {
        user: {},
      },
    });

    const result = await admin(req, res);

    codi.assertTrue(result instanceof Error);
    codi.assertEqual(result.message, 'admin_required');
  });
});
