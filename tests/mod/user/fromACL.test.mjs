const mockCompareSyncFn = codi.mock.fn();
const mockBcrypt = codi.mock.module('../../../mod/utils/bcrypt.cjs', {
  namedExports: {
    bcrypt: {
      compareSync: mockCompareSyncFn,
    },
  },
});

const mockAclfn = codi.mock.fn();
const mockACL = codi.mock.module('../../../mod/user/acl.js', {
  defaultExport: mockAclfn,
});

const mockMailerFn = codi.mock.fn();
const mockMailer = codi.mock.module('../../../mod/utils/mailer.js', {
  defaultExport: mockMailerFn,
});

const mockLanguageTempFn = codi.mock.fn();
const mockLanguageTemp = codi.mock.module(
  '../../../mod/utils/languageTemplates.js',
  {
    defaultExport: mockLanguageTempFn,
  },
);

const mockReqHostFn = codi.mock.fn();
const mockReqHost = codi.mock.module('../../../mod/utils/reqHost.js', {
  defaultExport: mockReqHostFn,
});

await codi.describe(
  { name: 'acl', id: 'user_acl', parentId: 'user' },
  async () => {
    const { default: fromACL } = await import('../../../mod/user/fromACL.js');

    await codi.it(
      { name: 'no email provided', parentId: 'user_acl' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          body: {},
          params: {
            language: 'fr',
          },
          headers: {
            host: 'localhost:3000',
          },
        });

        const result = await fromACL(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'E-mail manquant');
      },
    );

    await codi.it(
      { name: 'no password provided', parentId: 'user_acl' },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          body: { email: 'test@geolytix.com' },
          params: {
            language: 'fr',
          },
          headers: {
            host: 'localhost:3000',
          },
        });

        const result = await fromACL(req, res);

        codi.assertTrue(result instanceof Error);
        codi.assertEqual(result.message, 'Mot de passe manquant');
      },
    );
  },
);

mockBcrypt.restore();
mockACL.restore();
mockMailer.restore();
mockLanguageTemp.restore();
mockReqHost.restore();
