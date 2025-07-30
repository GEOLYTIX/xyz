globalThis.xyzEnv = {
  PRIVATE: '192.168.1.1:3000|user:password|acl.test',
};

const originalWarn = console.warn;
const mockWarn = [];

console.warn = (log) => {
  mockWarn.push(log);
};

const mockMailerFn = codi.mock.fn();
const mockMailer = codi.mock.module('../../../mod/utils/mailer.js', {
  defaultExport: mockMailerFn,
});

await codi.describe(
  { name: 'register: ', id: 'user_register', parentId: 'user' },
  async () => {
    const { default: register } = await import('../../../mod/user/register.js');
    await codi.it(
      {
        name: 'USER_DOMAINS - full domain with invalid email',
        parentId: 'user_register',
      },
      async () => {
        globalThis.xyzEnv.USER_DOMAINS = 'geolytix.com';

        const { req, res } = codi.mockHttp.createMocks({
          headers: {
            host: 'localhost',
          },
          body: {
            email: 'dev_1@geolytix.co.uk',
            password: 'ValidPass123!',
            language: 'en',
          },
        });

        await register(req, res);
        codi.assertTrue(res.statusCode === 400);
        codi.assertEqual(res._getData(), 'Provided email address is invalid');
      },
    );

    await codi.it(
      {
        name: 'USER_DOMAINS - short domain with invalid email',
        parentId: 'user_register',
      },
      async () => {
        globalThis.xyzEnv.USER_DOMAINS = 'geolytix';

        const { req, res } = codi.mockHttp.createMocks({
          headers: {
            host: 'localhost',
          },
          body: {
            email: 'dev_1@test.co.uk',
            password: 'ValidPass123!',
            language: 'en',
          },
        });

        await register(req, res);
        codi.assertTrue(res.statusCode === 400);
        codi.assertEqual(res._getData(), 'Provided email address is invalid');
      },
    );

    await codi.it(
      {
        name: 'USER_DOMAINS - full domain with valid email',
        parentId: 'user_register',
      },
      async () => {
        globalThis.xyzEnv.USER_DOMAINS = 'geolytix.com';

        const { req, res } = codi.mockHttp.createMocks({
          headers: {
            host: 'localhost',
          },
          body: {
            email: 'dev_1@geolytix.com',
            password: 'ValidPass123!',
            language: 'en',
          },
        });

        await register(req, res);
        codi.assertTrue(res.statusCode === 200);
      },
    );

    await codi.it(
      {
        name: 'USER_DOMAINS - short domain with valid email',
        parentId: 'user_register',
      },
      async () => {
        globalThis.xyzEnv.USER_DOMAINS = 'geolytix';

        const { req, res } = codi.mockHttp.createMocks({
          headers: {
            host: 'localhost',
          },
          body: {
            email: 'dev_1@geolytix.whatever',
            password: 'ValidPass123!',
            language: 'en',
          },
        });

        await register(req, res);
        codi.assertTrue(res.statusCode === 200);
      },
    );
  },
);

console.warn = originalWarn;
mockMailer.restore();
