codi.describe(
  { name: 'Provider: Cloudfront', id: 'provider_cloudfront' },
  () => {
    codi.it(
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
          'We expect to see an error be returned',
        );
      },
    );
  },
);
