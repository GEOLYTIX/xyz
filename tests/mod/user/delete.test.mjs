const aclfn = codi.mock.fn();
const mockACL = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclfn,
});

const mailerfn = codi.mock.fn();
const mockMailer = codi.mock.module('../../../mod/utils/mailer.js', {
  defaultExport: mailerfn,
});

const originalLog = console.log;
const mockLogs = [];

console.log = (log) => {
  mockLogs.push(log);
};

await codi.describe(
  { name: 'delete:', id: 'user_delete', parentId: 'user' },
  async () => {
    const { default: deleteUser } = await import('../../../mod/user/delete.js');
    await codi.it(
      { name: 'no email provided', parentId: 'user_delete' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {},
        });

        await deleteUser(req, res);

        codi.assertEqual(res.statusCode, 500);
        codi.assertEqual(res._getData(), 'Missing email param');
      },
    );

    await codi.it(
      { name: 'no user provided', parentId: 'user_delete' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: 'test@geolytix.co.uk',
          },
        });

        const result = await deleteUser(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'login_required');
      },
    );

    await codi.it(
      { name: 'delete user', parentId: 'user_delete' },
      async () => {
        const user = {
          email: 'test@geolytix.co.uk',
        };

        aclfn.mock.mockImplementation(() => {
          return [user];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: user.email,
            user: {
              email: 'admin@geolytix.co.uk',
              admin: true,
            },
          },
        });

        await deleteUser(req, res);

        codi.assertEqual(res._getData(), 'User account deleted.');
      },
    );

    await codi.it({ name: 'acl error', parentId: 'user_delete' }, async () => {
      const user = {
        email: 'test@geolytix.co.uk',
      };

      aclfn.mock.mockImplementation(() => {
        return new Error('Something bad happened');
      });

      const { default: deleteUser } = await import(
        '../../../mod/user/delete.js'
      );

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          email: user.email,
          user: {
            email: 'admin@geolytix.co.uk',
            admin: true,
          },
        },
      });

      await deleteUser(req, res);

      codi.assertEqual(res.statusCode, 500);
      codi.assertEqual(res._getData(), 'Failed to access ACL.');
    });

    await codi.it(
      { name: 'user deleting themselves', parentId: 'user_delete' },
      async () => {
        const user = {
          email: 'admin@geolytix.co.uk',
        };

        aclfn.mock.mockImplementation(() => {
          return [user];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: user.email,
            user: {
              email: 'admin@geolytix.co.uk',
              admin: true,
            },
          },
        });

        await deleteUser(req, res);

        const header = res.getHeader('set-cookie');

        codi.assertEqual(res.statusCode, 200);
        codi.assertTrue(header !== null);
        codi.assertEqual(res._getData(), 'User account deleted.');
      },
    );

    await codi.it(
      { name: 'user deleting themselves(not admin)', parentId: 'user_delete' },
      async () => {
        const user = {
          email: 'admin@geolytix.co.uk',
        };

        aclfn.mock.mockImplementation(() => {
          return [user];
        });

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            email: user.email,
            user: {
              email: 'admin@geolytix.co.uk',
            },
          },
        });

        await deleteUser(req, res);

        const header = res.getHeader('set-cookie');

        codi.assertEqual(res.statusCode, 200);
        codi.assertTrue(header !== null);
        codi.assertEqual(res._getData(), 'User account deleted.');
      },
    );
  },
);

mockACL.restore();
mockMailer.restore();
console.log = originalLog;
