const registry = new codi.MockModuleRegistry();
registry.mock('./acl', null);

import update from '../../../mod/user/update.js';

const params = {
  name: 'User Update Tests',
  id: 'user_update_tests',
};

codi.describe(params, async () => {
  codi.it(
    {
      name: 'should return error when ACL is null',
      parentId: 'user_update_tests',
    },
    async () => {
      const req = {
        params: {
          user: { admin: true },
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
      codi.assertEqual(result.code, 500);
      codi.assertEqual(result.message, 'ACL unavailable.');
    },
  );

  codi.it(
    {
      name: 'should return error for non-admin users',
      parentId: 'user_update_tests',
    },
    async () => {
      const registry = new codi.MockModuleRegistry();
      registry.mock('./acl', async () => []);

      const update = registry.require('../../../mod/user/update.js');

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

  codi.it(
    { name: 'should send approval email', parentId: 'user_update_tests' },
    async () => {
      const registry = new codi.MockModuleRegistry();
      let mailOptions;

      registry.mock('./acl', async () => []);
      registry.mock('../utils/mailer', async (options) => {
        mailOptions = options;
        return true;
      });

      const update = registry.require('../../../mod/user/update.js');

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

  codi.it(
    {
      name: 'should reject invalid update keys',
      parentId: 'user_update_tests',
    },
    async () => {
      const registry = new codi.MockModuleRegistry();
      registry.mock('./acl', async () => []);

      const update = registry.require('../../../mod/user/update.js');

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
