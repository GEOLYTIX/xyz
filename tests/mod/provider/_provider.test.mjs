import 'dotenv/config';
import '../../../mod/utils/processEnv.js';

const mockedFile = codi.mock.module('../../../mod/provider/file.js', {
  defaultExport: (ref) => {
    ref = '';
    return String('Look at me go from the file provider fam!');
  },
});

const mockedCloudfront = codi.mock.module(
  '../../../mod/provider/cloudfront.js',
  {
    defaultExport: (ref) => {
      ref = '';
      return '{"test":{"another_test":{}}}';
    },
  },
);

const mockeds3 = codi.mock.module('../../../mod/provider/s3.js', {
  defaultExport: (ref) => {
    ref = '';
    return 'http://localhost:3000/';
  },
});

await codi.describe({ name: 'Provider:', id: 'provider_test' }, async () => {
  await codi.it(
    { name: 'Bogus provider test', parentId: 'provider_test' },
    async () => {
      const { default: provider } = await import(
        '../../../mod/provider/_provider.js'
      );

      const req = {
        params: {
          provider: 'mongo',
        },
      };

      const res = {
        status: (code) => ({ send: (message) => ({ code, message }) }),
        send: (message) => ({ message }),
      };

      const result = await provider(req, res);

      codi.assertEqual(result.code, 404);
      codi.assertEqual(
        result.message,
        "Failed to validate 'provider=mongo' param.",
      );
    },
  );

  await codi.describe(
    {
      name: 'Test Providers',
      id: 'provider_test_working',
      parentId: 'provider_test',
    },
    async () => {
      const providers = ['file', 'cloudfront', 's3'];

      const expectedValues = {
        file: {
          data: 'Look at me go from the file provider fam!',
          content_type: 'application/text',
          headers: {
            'content-type': 'application/text',
          },
        },
        cloudfront: {
          data: '{"test":{"another_test":{}}}',
          content_type: 'application/json',
          headers: {
            'content-type': 'application/json',
          },
        },
        s3: {
          data: 'http://localhost:3000/',
          content_type: 'application/text',
          headers: {
            'content-type': 'application/text',
          },
        },
      };

      const { default: provider } = await import(
        '../../../mod/provider/_provider.js'
      );

      providers.forEach(async (providerName) => {
        try {
          await codi.it(
            {
              name: `Provider: ${providerName}`,
              parentId: 'provider_test_working',
            },
            async () => {
              const { req, res } = codi.mockHttp.createMocks({
                params: {
                  provider: providerName,
                  content_type: expectedValues[providerName].content_type,
                },
              });

              await provider(req, res);

              const data = res._getData();
              const headers = res.getHeaders();

              codi.assertEqual(data, expectedValues[providerName].data);
              codi.assertEqual(headers, expectedValues[providerName].headers);
            },
          );
        } catch (error) {
          console.log(error);
        }
      });
    },
  );
});

mockedFile.restore();
mockedCloudfront.restore();
mockeds3.restore();
