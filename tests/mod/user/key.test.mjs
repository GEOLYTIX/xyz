const aclFn = codi.mock.fn();
const mockedacl = codi.mock.module('../../../mod/user/acl.js', {
  cache: false,
  defaultExport: aclFn,
  namedExports: {
    acl: aclFn,
  },
});

await codi.describe(
  { name: 'key:', id: 'user_key', parentId: 'user' },
  async () => {
    const { default: apiKey } = await import('../../../mod/user/key.js');

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
        user: 'test@email.com',
        admin: true,
      },
    });

    codi.it({ name: 'user not provided', parentId: 'user_key' }, async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user: null,
        },
      });

      const key = await apiKey(req, res);

      codi.assertTrue(key.message === 'login_required');
    });

    codi.it({ name: 'acl throws an error', parentId: 'user_key' }, async () => {
      aclFn.mock.mockImplementation(async () => {
        return new Error('aclFailed');
      });

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          user: 'test@geolytix.co.uk',
          admin: true,
        },
      });

      await apiKey(req, res);
      codi.assertTrue(res._getData() === 'Failed to access ACL.');
    });

    codi.it(
      { name: 'deny access if no user is found', parentId: 'user_key' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          return [null];
        });

        await apiKey(req, res);

        codi.assertTrue(res.statusCode === 401);
        codi.assertTrue(res._getData().includes('Unauthorized access.'));
      },
    );

    codi.it(
      { name: 'deny access to unverified users', parentId: 'user_key' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          const mockUser = { ...user };
          mockUser.verified = false;
          return [mockUser];
        });

        await apiKey(req, res);

        codi.assertTrue(res.statusCode === 401);
        codi.assertTrue(res._getData().includes('Unauthorized access.'));
      },
    );

    codi.it(
      { name: 'deny access to blocked users', parentId: 'user_key' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          const mockUser = { ...user };
          mockUser.blocked = true;
          return [mockUser];
        });

        await apiKey(req, res);

        codi.assertTrue(res.statusCode === 401);
        codi.assertTrue(res._getData().includes('Unauthorized access.'));
      },
    );

    codi.it(
      { name: 'deny access to unapproved users', parentId: 'user_key' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          const mockUser = { ...user };
          mockUser.approved = false;
          return [mockUser];
        });

        await apiKey(req, res);

        codi.assertTrue(res.statusCode === 401);
        codi.assertTrue(res._getData().includes('Unauthorized access.'));
      },
    );
    codi.it(
      { name: 'deny access to no api access users', parentId: 'user_key' },
      async () => {
        aclFn.mock.mockImplementation(async () => {
          const mockUser = { ...user };
          mockUser.api = false;
          return [mockUser];
        });

        await apiKey(req, res);

        codi.assertTrue(res.statusCode === 401);
        codi.assertTrue(res._getData().includes('Unauthorized access.'));
      },
    );

    codi.it(
      { name: 'successfully generate a key', parentId: 'user_key' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            user: user,
          },
        });

        aclFn.mock.mockImplementation(async () => {
          return [user];
        });

        await apiKey(req, res);

        codi.assertTrue(res.statusCode === 200);
        codi.assertTrue(res._getData().startsWith('ey'));
      },
    );
  },
);

mockedacl.restore();
