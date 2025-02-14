const aclFn = codi.mock.fn();
const mockedacl = codi.mock.module('../../../mod/user/acl.js', {
  cache: false,
  defaultExport: aclFn,
  namedExports: {
    acl: aclFn,
  },
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

    const { req, res } = codi.mockHttp.createMocks({
      params: {
        user,
      },
    });

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

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user: user.email,
            admin: true,
          },
        });

        const userList = await user_list(req, res);

        codi.assertTrue(userList instanceof Error);
      },
    );

    codi.it(
      { name: 'no users found in the acl', parentId: 'user_list' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          return null;
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user: user.email,
            admin: true,
          },
        });

        const userList = await user_list(req, res);

        codi.assertTrue(userList.length == undefined);
      },
    );

    codi.it({ name: 'users listed', parentId: 'user_list' }, async () => {
      aclFn.mock.mockImplementation(async () => {
        return Array.from(['row1', 'row2', 'row3']);
      });

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user: user.email,
          admin: true,
        },
      });

      await user_list(req, res);

      codi.assertTrue(res.statusCode === 200);
    });

    /*codi.it({ name: 'TEST ME! @cityremade', parentId: 'user_list' }, () => {

      //TODO: @cityremade Please test me
      codi.assertTrue(false);
    });*/
  },
);

mockedacl.restore();
