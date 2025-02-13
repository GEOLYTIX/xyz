globalThis.xyzEnv = {};

const mockedCloudfrontFn = codi.mock.fn();

const cloudfrontSign = codi.mock.module('../../../mod/sign/cloudfront.js', {
  defaultExport: mockedCloudfrontFn,
});

const mockAgent = new codi.mockHttp.MockAgent();
codi.mockHttp.setGlobalDispatcher(mockAgent);

await codi.describe(
  {
    name: 'cloudfront:',
    id: 'provider_cloudfront',
    parentId: 'provider',
  },
  async () => {
    const { default: cloudfront } = await import(
      '../../../mod/provider/cloudfront.js'
    );
    await codi.it(
      {
        name: 'Should handle cloudfront signer error',
        parentId: 'provider_cloudfront',
      },
      async () => {
        mockedCloudfrontFn.mock.mockImplementation(
          function cloudfront_signer() {
            return new Error('Cloudfront found an error');
          },
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

        mockedCloudfrontFn.mock.mockImplementation(
          function cloudfront_signer() {
            return expected.url;
          },
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
              url: 'http://localhost:3000/thing1.json',
              path: '/thing1.json',
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
              url: 'http://localhost:3000/proper.json',
              path: '/proper.json',
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

        const mockPool = mockAgent.get(new RegExp('http://localhost:3000'));

        Object.keys(testCases).forEach(async (test) => {
          mockedCloudfrontFn.mock.mockImplementation(
            function cloudfront_signer() {
              return testCases[test].params.url;
            },
          );

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

          mockPool
            .intercept({ path: testCases[test].params.path })
            .reply(testCases[test].status, testCases[test].body);

          const results = await cloudfront(req);

          codi.assertEqual(results, testCases[test].expected);
        });
      },
    );
  },
);

cloudfrontSign.restore();
codi.mock.reset();
