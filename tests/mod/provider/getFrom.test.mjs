const mockAgent = new codi.mockHttp.MockAgent();
codi.mockHttp.setGlobalDispatcher(mockAgent);

const mockFileFn = codi.mock.fn();
const mockFile = codi.mock.module('../../../mod/provider/file.js', {
  defaultExport: mockFileFn,
});

const mockCloudFrontFn = codi.mock.fn();
const mockCloudFront = codi.mock.module('../../../mod/provider/cloudfront.js', {
  defaultExport: mockCloudFrontFn,
});

await codi.describe({ name: 'getFrom:', id: 'getFrom' }, async () => {
  await codi.it({ name: 'https', parentId: 'getFrom' }, async () => {
    const { default: getFrom } = await import(
      '../../../mod/provider/getFrom.js'
    );

    const resBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    const mockPool = mockAgent.get(new RegExp('https://geolytix.com/*'));

    mockPool.intercept({ path: '/config/workspace.json' }).reply(200, resBody);

    const url = 'https://geolytix.com/config/workspace.json';

    const results = await getFrom['https'](url);

    codi.assertEqual(
      results,
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });

  await codi.it({ name: 'file', parentId: 'getFrom' }, async () => {
    const { default: getFrom } = await import(
      '../../../mod/provider/getFrom.js'
    );

    const filePath = 'file:../../workspaces/workspace.json';

    const fileBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    mockFileFn.mock.mockImplementation(function file() {
      return JSON.parse(fileBody);
    });

    const results = await getFrom['file'](filePath);

    codi.assertEqual(
      results,
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });

  await codi.it({ name: 'cloudfront', parentId: 'getFrom' }, async () => {
    const { default: getFrom } = await import(
      '../../../mod/provider/getFrom.js'
    );

    globalThis.xyzEnv = {
      KEY_CLOUDFRONT: 'CLOUDFRONTKEY',
    };

    const cloudFrontURL =
      'cloudfront:aws.cloudfront.example/workspaces/workspace.json';

    const fileBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    mockCloudFrontFn.mock.mockImplementation(function cloudfront(ref) {
      return JSON.parse(fileBody);
    });

    const results = await getFrom['cloudfront'](cloudFrontURL);

    codi.assertEqual(
      results,
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );
  });
});

mockFile.restore();
mockCloudFront.restore();
