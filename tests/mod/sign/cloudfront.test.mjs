const mockreadFileSyncFn = codi.mock.fn();
const mockreadFileSync = codi.mock.module('fs', {
  namedExports: {
    readFileSync: mockreadFileSyncFn,
  },
});

const mockDirnameFn = codi.mock.fn();
const mockJoinFn = codi.mock.fn();
const mockPath = codi.mock.module('path', {
  namedExports: {
    dirname: mockDirnameFn,
    join: mockJoinFn,
  },
});

const mockFileURLToPathFn = codi.mock.fn();
const mockFileURLToPath = codi.mock.module('url', {
  namedExports: {
    fileURLToPath: mockFileURLToPathFn,
  },
});

await codi.describe(
  {
    name: 'cloudfront',
    id: 'sign_cloudfront',
    parentId: 'sign',
  },
  async () => {
    await codi.it(
      { name: 'get url', parentId: 'sign_cloudfront' },
      async () => {
        const { default: cloudfront_signer } = await import(
          '../../../mod/sign/cloudfront.js'
        );

        const req_url = '';

        const signedUrl = await cloudfront_signer(req_url);

        console.log(signedUrl);
      },
    );
  },
);

mockFileURLToPath.restore();
mockreadFileSync.restore();
mockPath.restore();
