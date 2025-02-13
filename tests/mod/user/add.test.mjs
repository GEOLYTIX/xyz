const aclMockFn = codi.mock.fn();
const aclMock = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclMockFn,
});

await codi.describe(
  { name: 'add: ', id: 'user_add', parentId: 'user' },
  async () => {
    const { default: addUser } = await import('../../../mod/user/add.js');
    await codi.it({ name: 'Adding a user', parentId: 'user_add' }, async () => {
      aclMockFn.mock.mockImplementation(function acl(q) {
        return [];
      });

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          email: 'dev_1@geolytix.co.uk',
          user: {
            admin: true,
          },
        },
      });

      await addUser(req, res);

      const message = res._getData();

      codi.assertEqual(message, 'dev_1@geolytix.co.uk added to ACL.');
    });

    await codi.it(
      { name: 'Missing email param', parentId: 'user_add' },
      async () => {
        const { default: addUser } = await import('../../../mod/user/add.js');

        const { req, res } = codi.mockHttp.createMocks({
          params: {},
        });

        await addUser(req, res);

        const status = res.statusCode;
        const message = res._getData();

        codi.assertEqual(status, 500);
        codi.assertEqual(message, 'Missing email param');
      },
    );

    await codi.it(
      { name: 'Missing user param', parentId: 'user_add' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'dev_1@geolytix.co.uk',
          },
        });

        const result = await addUser(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'login_required');
      },
    );

    await codi.it(
      { name: 'Missing admin param', parentId: 'user_add' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'dev_1@geolytix.co.uk',
            user: {},
          },
        });

        const result = await addUser(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'admin_required');
      },
    );

    await codi.it(
      { name: 'error from acl', parentId: 'user_add' },
      async () => {
        aclMockFn.mock.mockImplementation(function acl() {
          return new Error('There was an issue with the acl');
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'dev_1@geolytix.co.uk',
            user: {
              admin: true,
            },
          },
        });

        await addUser(req, res);

        codi.assertEqual(res.statusCode, 500);
        codi.assertEqual(res._getData(), 'Failed to access ACL.');
      },
    );

    await codi.it(
      { name: 'user already exists', parentId: 'user_add' },
      async () => {
        aclMockFn.mock.mockImplementation(function acl() {
          return ['user'];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'dev_1@geolytix.co.uk',
            user: {
              admin: true,
            },
          },
        });

        await addUser(req, res);

        codi.assertEqual(res._getData(), 'User already exists in ACL.');
      },
    );

    await codi.it(
      { name: 'user already exists', parentId: 'user_add' },
      async () => {
        aclMockFn.mock.mockImplementation(function acl(q) {
          if (q.includes('INSERT INTO')) {
            return new Error();
          }
          return [];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'dev_1@geolytix.co.uk',
            user: {
              admin: true,
            },
          },
        });

        await addUser(req, res);

        codi.assertEqual(res.statusCode, 500);
        codi.assertEqual(res._getData(), 'Failed to add user account to ACL.');
      },
    );
  },
);

aclMock.restore();
