// Mock the acl module.
const aclFn = codi.mock.fn();

const mockacl = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclFn,
});

await codi.describe(
  { name: 'log:', id: 'user_log', parentId: 'user' },
  async () => {
    const { default: accessLog } = await import('../../../mod/user/log.js');

    codi.it(
      {
        name: 'Returns an error if no email parameter provided ',
        parentId: 'user_log',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {},
        });

        await accessLog(req, res);

        codi.assertEqual(res.statusCode, 500);
        codi.assertEqual(res._getData(), 'Missing email param');
      },
    );
    codi.it(
      {
        name: 'Returns an error if email parameter provided but no user ',
        parentId: 'user_log',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test@geolytix.co.uk',
          },
        });

        const result = await accessLog(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'login_required');
      },
    );
    codi.it(
      {
        name: 'Returns an error if email parameter not yourself, and user is not an admin ',
        parentId: 'user_log',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test@geolytix.co.uk',
            user: {
              email: 'test1@geolytix.co.uk',
              admin: false,
            },
          },
        });

        const result = await accessLog(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'admin_required');
      },
    );
    codi.it(
      {
        name: 'Returns logs if email parameter is yourself ',
        parentId: 'user_log',
      },
      async () => {
        aclFn.mock.mockImplementation(() => {
          return [{ access_log: 'test' }];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test@geolytix.co.uk',
            user: {
              email: 'test@geolytix.co.uk',
              admin: false,
            },
          },
        });

        await accessLog(req, res);

        codi.assertEqual(res._getData(), { access_log: 'test' });

        aclFn.mock.mockImplementation(() => {
          return [{ access_log: 'test' }, { access_log: 'test' }];
        });

        await accessLog(req, res);
        codi.assertEqual(res._getData(), [
          { access_log: 'test' },
          { access_log: 'test' },
        ]);
      },
    );
    codi.it(
      {
        name: 'Returns logs if email parameter is someone else, and user is an admin ',
        parentId: 'user_log',
      },
      async () => {
        aclFn.mock.mockImplementation(() => {
          return [{ access_log: 'test' }];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test1@geolytix.co.uk',
            user: {
              email: 'test@geolytix.co.uk',
              admin: true,
            },
          },
        });

        await accessLog(req, res);

        codi.assertEqual(res._getData(), { access_log: 'test' });

        aclFn.mock.mockImplementation(() => {
          return [{ access_log: 'test' }, { access_log: 'test' }];
        });

        await accessLog(req, res);
        codi.assertEqual(res._getData(), [
          { access_log: 'test' },
          { access_log: 'test' },
        ]);
      },
    );
    codi.it(
      {
        name: 'Returns error if an error occurs in the acl module ',
        parentId: 'user_log',
      },
      async () => {
        aclFn.mock.mockImplementation(() => {
          return new Error('failed to access ACL');
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test1@geolytix.co.uk',
            user: {
              email: 'test@geolytix.co.uk',
              admin: true,
            },
          },
        });

        await accessLog(req, res);

        codi.assertEqual(res.statusCode, 500);
        codi.assertEqual(res._getData(), 'Failed to access ACL.');
      },
    );
    codi.it(
      {
        name: 'Returns 204 if no rows are returned from the acl module ',
        parentId: 'user_log',
      },
      async () => {
        aclFn.mock.mockImplementation(() => {
          return [];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test1@geolytix.co.uk',
            user: {
              email: 'test@geolytix.co.uk',
              admin: true,
            },
          },
        });

        await accessLog(req, res);

        codi.assertEqual(res.statusCode, 204);
        codi.assertEqual(res._getData(), 'No rows returned from table.');
      },
    );
  },
);

mockacl.restore();
