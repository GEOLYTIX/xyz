const params = {
  name: 'update: ',
  id: 'user_update',
  parentId: 'user',
};

const aclMockFn = codi.mock.fn();

const aclMock = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: aclMockFn,
});

const mailerMockFn = codi.mock.fn();

const mailerMock = codi.mock.module('../../../mod/utils/mailer.js', {
  defaultExport: mailerMockFn,
});

await codi.describe(params, async () => {
  const { default: update } = await import('../../../mod/user/update.js');
  await codi.it(
    {
      name: 'should return error for non-admin users',
      parentId: 'user_update',
    },
    async () => {
      aclMockFn.mock.mockImplementation(function acl() {
        return [];
      });

      const req = {
        params: {
          user: { admin: false },
          email: 'test@example.com',
          host: 'test.com',
        },
        body: {},
      };

      const res = {
        status: (code) => ({ send: (message) => ({ code, message }) }),
        send: (message) => ({ message }),
      };

      const result = await update(req, res);

      codi.assertTrue(result instanceof Error);
      codi.assertEqual(result.message, 'admin_user_login_required');
    },
  );

  await codi.it(
    { name: 'should send approval email', parentId: 'user_update' },
    async () => {
      let mailOptions;

      mailerMockFn.mock.mockImplementation(function mailer(options) {
        mailOptions = options;
        return true;
      });

      const req = {
        params: {
          user: { admin: true },
          email: 'test@example.com',
          host: 'test.com',
        },
        body: {
          email: 'test@example.com',
          approved: true,
          language: 'en',
        },
      };

      const res = {
        status: (code) => ({ send: (message) => ({ code, message }) }),
        send: (message) => ({ message }),
      };

      await update(req, res);

      codi.assertEqual(mailOptions, {
        template: 'approved_account',
        language: 'en',
        to: 'test@example.com',
        host: 'test.com',
      });
    },
  );

  await codi.it(
    {
      name: 'should reject invalid update keys',
      parentId: 'user_update',
    },
    async () => {
      const req = {
        params: {
          user: { admin: true },
          email: 'test@example.com',
          host: 'test.com',
        },
        body: {
          email: 'test@example.com',
          'invalid;key': 'value',
        },
      };

      const res = {
        status: (code) => ({ send: (message) => ({ code, message }) }),
        send: (message) => ({ message }),
      };

      const result = await update(req, res);
      codi.assertEqual(result.code, 400);
      codi.assertEqual(
        result.message,
        'Invalid key in user object for SQL update.',
      );
    },
  );
});

aclMock.restore();
mailerMock.restore();
