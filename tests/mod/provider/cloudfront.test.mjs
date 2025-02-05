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

    await codi.describe(
      {
        name: 'Fetches signedURL',
        id: 'provider_cloudfront_fetch',
        parentId: 'provider_cloudfront',
      },
      async () => {
        const testCases = {
          error: {
            status: 300,
            body: 'test string',
            params: {
              url: 'https://aws.signedURL.test/thing1.json',
            },
            expected: new Error(),
          },
          json: {
            status: 200,
            body: {
              objectKey: 'example-image.jpg',
              bucketName: 'my-aws-bucket',
              region: 'us-east-1',
              expires: '2023-12-31T23:59:59Z',
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'max-age=3600',
              },
            },
            params: {
              url: 'https://aws.signedURL.test/proper.json',
            },
            expected: {
              objectKey: 'example-image.jpg',
              bucketName: 'my-aws-bucket',
              region: 'us-east-1',
              expires: '2023-12-31T23:59:59Z',
              headers: {
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'max-age=3600',
              },
            },
          },
        };

        codi.mock.module('../../../mod/sign/cloudfront.js', () => {
          const cloudfront = async () => {
            return testCases.error.url;
          };
          return { default: cloudfront };
        });

        const { default: cloudfront } = await import(
          '../../../mod/provider/cloudfront.js'
        );

        Object.keys(testCases).forEach(async (test) => {
          await codi.it(
            {
              name: `cloudfront: ${test}`,
              parentId: 'provider_cloudfront',
            },
            async () => {
              try {
                codi.mock.module('../../../mod/sign/cloudfront.js', () => {
                  const cloudfront = async () => {
                    return testCases[test].params.url;
                  };
                  return { default: cloudfront };
                });

                const { req } = codi.mockHttp.createMocks(
                  {
                    params: {
                      url: testCases[test].params.url,
                      body: testCases[test].body,
                    },
                  },
                  {
                    locals: {
                      statusCode: testCases[test].status,
                    },
                  },
                );

                codi.mockFetch(testCases[test].params.url, {
                  data: testCases[test].body,
                  response: {
                    status: testCases[test].status,
                  },
                });

                const results = await cloudfront(req);
                codi.assertEqual(results, testCases[test].expected);
              } catch (error) {
                console.error('Test failed:', error);
              } finally {
                globalThis.fetch = null;
              }
            },
          );
        });
      },
    );
  },
);
