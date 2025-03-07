const mockAgent = new codi.mockHttp.MockAgent();
codi.mockHttp.setGlobalDispatcher(mockAgent);

const { default: file } = await import('../../../mod/provider/file.js');

const mockFileFn = codi.mock.fn(file);
const mockFile = codi.mock.module('../../../mod/provider/file.js', {
  defaultExport: mockFileFn,
});

const mockCloudFrontFn = codi.mock.fn();
const mockCloudFront = codi.mock.module('../../../mod/provider/cloudfront.js', {
  defaultExport: mockCloudFrontFn,
});

await codi.describe(
  { name: 'getFrom:', id: 'getFrom', parentId: 'provider' },
  async () => {
    const { default: getFrom } = await import(
      '../../../mod/provider/getFrom.js'
    );

    await codi.it({ name: 'https', parentId: 'getFrom' }, async () => {
      const resBody = JSON.stringify(
        '{ "templates": {}, "locale": { "layers": {}, }, }',
      );

      const mockPool = mockAgent.get(new RegExp('https://geolytix.com/*'));

      mockPool
        .intercept({ path: '/config/workspace.json' })
        .reply(200, resBody);

      const url = 'https://geolytix.com/config/workspace.json';

      const results = await getFrom['https'](url);

      codi.assertEqual(
        results,
        '{ "templates": {}, "locale": { "layers": {}, }, }',
      );
    });

    await codi.it({ name: 'file', parentId: 'getFrom' }, async () => {
      const filePath = 'file:../../workspaces/workspace.json';

      const fileBody = JSON.stringify(
        '{ "templates": {}, "locale": { "layers": {}, }, }',
      );

      mockFileFn.mock.mockImplementationOnce(function file() {
        return JSON.parse(fileBody);
      });

      const results = await getFrom['file'](filePath);

      codi.assertEqual(
        results,
        '{ "templates": {}, "locale": { "layers": {}, }, }',
      );
    });

    await codi.it({ name: 'cloudfront', parentId: 'getFrom' }, async () => {
      globalThis.xyzEnv = {
        KEY_CLOUDFRONT: 'CLOUDFRONTKEY',
      };

      const cloudFrontURL =
        'cloudfront:aws.cloudfront.example/workspaces/workspace.json';

      const fileBody = JSON.stringify(
        '{ "templates": {}, "locale": { "layers": {}, }, }',
      );

      mockCloudFrontFn.mock.mockImplementationOnce(function cloudfront(ref) {
        return JSON.parse(fileBody);
      });

      const results = await getFrom['cloudfront'](cloudFrontURL);

      codi.assertEqual(
        results,
        '{ "templates": {}, "locale": { "layers": {}, }, }',
      );
    });
  },
);

mockFile.restore();
mockCloudFront.restore();
