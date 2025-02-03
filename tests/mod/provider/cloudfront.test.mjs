globalThis.xyzEnv = {};

await codi.describe(
  { name: 'Provider: Cloudfront', id: 'provider_cloudfront' },
  async () => {
    await codi.it(
      {
        name: 'Should handle cloudfront signer error',
        parentId: 'provider_cloudfront',
      },
      async () => {
        codi.mock.module('../../../mod/sign/cloudfront.js', () => {
          const cloudfront = () => {
            return new Error('Cloudfront found an error');
          };

          return { default: cloudfront };
        });

        const { default: cloudfront } = await import(
          '../../../mod/provider/cloudfront.js'
        );

        const { req } = codi.mockHttp.createMocks();

        const result = await cloudfront(req);

        codi.assertTrue(
          result instanceof Error,
          'We expect to see an error returned',
        );
      },
    );

    await codi.it(
      { name: 'Return only signedURL', parentId: 'provider_cloudfront' },
      async () => {
        const expected = {
          url: 'https://aws.signed.url.com/*',
        };

        codi.mock.module('../../../mod/sign/cloudfront.js', () => {
          const cloudfront = async () => {
            return expected.url;
          };

          return { default: cloudfront };
        });

        const { default: cloudfront } = await import(
          '../../../mod/provider/cloudfront.js'
        );

        const { req } = codi.mockHttp.createMocks({
          params: {
            signedURL: true,
          },
        });

        const result = await cloudfront(req);

        codi.assertEqual(
          result,
          expected.url,
          'We should see the expected URL returned',
        );
      },
    );
  },
);
