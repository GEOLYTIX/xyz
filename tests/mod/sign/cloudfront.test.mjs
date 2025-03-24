const mockreadFileSync = codi.mock.module('fs', {
  namedExports: {
    readFileSync: () => {
      return 'PRIVATEKEY';
    },
  },
});

const mockGetSignedURLFn = codi.mock.fn();
const mockAwsCloudfront = codi.mock.module('@aws-sdk/cloudfront-signer', {
  namedExports: {
    getSignedUrl: mockGetSignedURLFn,
  },
});

globalThis.xyzEnv = {
  SRC_TEST: 'test.com',
  KEY_CLOUDFRONT: 'IAMACLOUDFRONTKEY',
};

await codi.describe(
  {
    name: 'cloudfront:',
    id: 'sign_cloudfront',
    parentId: 'sign',
  },
  async () => {
    const { default: cloudfront_signer } = await import(
      '../../../mod/sign/cloudfront.js'
    );

    await codi.it(
      { name: 'get url', parentId: 'sign_cloudfront' },
      async () => {
        const id = crypto.randomUUID();

        mockGetSignedURLFn.mock.mockImplementation((cloudfront) => {
          return cloudfront.url + '?key=' + id;
        });

        const req_url = '{TEST}/cool.json';

        const signedUrl = await cloudfront_signer(req_url);

        codi.assertEqual(signedUrl, `https://test.com/cool.json?key=${id}`);
      },
    );
  },
);

mockreadFileSync.restore();
mockAwsCloudfront.restore();
