const aclFn = codi.mock.fn();

const mockacl = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclFn,
});

await codi.describe(
  { name: 'list', id: 'user_list', parentId: 'user' },
  async () => {
    const { default: user_list } = await import('../../../mod/user/list.js');

    const user = {
      api: true,
      verified: true,
      approved: true,
      blocked: false,
      email: 'test@email.com',
      roles: ['test'],
    };

    codi.it({ name: 'user missing', parentId: 'user_list' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user: null,
        },
      });

      const userList = await user_list(req, res);

      codi.assertTrue(userList.message == 'login_required');
    });

    codi.it(
      { name: 'admin rights not granted', parentId: 'user_list' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user,
          },
        });

        const userList = await user_list(req, res);

        codi.assertTrue(userList.message == 'admin_required');
      },
    );

    codi.it(
      { name: 'acl throws an error', parentId: 'user_list' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          return new Error('aclFailed');
        });

        user.admin = true;

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user: user,
          },
        });

        await user_list(req, res);

        codi.assertEqual(res.statusCode, 500);
        codi.assertEqual(res._getData(), 'Failed to access ACL.');
      },
    );

    codi.it(
      { name: 'no users found in the acl', parentId: 'user_list' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          return [];
        });

        user.admin = true;

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user: user,
          },
        });

        await user_list(req, res);

        codi.assertEqual(res.statusCode, 202);
        codi.assertEqual(res._getData(), 'No rows returned from table.');
      },
    );

    codi.it({ name: 'return users', parentId: 'user_list' }, async () => {
      aclFn.mock.mockImplementation(() => {
        return ['user1', 'user2', 'user3'];
      });

      user.admin = true;

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user: user,
        },
      });

      await user_list(req, res);

      const users = await res._getData();

      codi.assertEqual(users, ['user1', 'user2', 'user3']);
    });
  },
);

mockacl.restore();
