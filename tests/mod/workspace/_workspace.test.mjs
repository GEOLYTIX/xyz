import getKeyMethod from '../../../mod/workspace/_workspace.js';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

await codi.describe({ name: 'workspace:', id: 'workspace' }, async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
  };

  //Calling the cache method with force to reload a new workspace
  await checkWorkspaceCache(true);

  await codi.describe(
    {
      name: 'Test method keys',
      id: 'workspace_keyMethod',
      parentId: 'workspace',
    },
    async () => {
      const testMethods = [
        { key: 'layer', value: 'OSM' },
        { key: 'locale', value: '' },
        { key: 'locales', value: '' },
        { key: 'roles', value: '' },
        { key: 'test', value: '' },
      ];

      testMethods.forEach((testMethod) => {
        codi.it(
          { name: `${testMethod.key}`, parentId: 'workspace_keyMethod' },
          async () => {
            const { req, res } = codi.mockHttp.createMocks({
              params: { key: testMethod.key, layer: testMethod.value },
            });

            await getKeyMethod(req, res);
            const result = res._getData();

            codi.assertTrue(
              result !== null,
              `Need to ensure we get a response from ${testMethod.key}`,
            );
          },
        );
      });
    },
  );

  codi.it(
    { name: 'nested locales', parentId: 'workspace', id: 'workspace_locales' },
    async () => {
      const expectedLayers = ['OSM', 'brand_a_layer', 'brand_b_layer'];
      const expectedKeys = ['europe', 'brand_a_locale', 'brand_b_locale'];
      const expectedName = 'europe/brand_a_locale/brand_b_locale';

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          key: 'locale',
          locale: ['europe', 'brand_a_locale', 'brand_b_locale'],
          user: {
            roles: ['europe', 'brand_b'],
          },
        },
      });

      await getKeyMethod(req, res);

      let result = res._getData();

      result = JSON.parse(result);

      codi.assertEqual(
        result.layers,
        expectedLayers,
        `We expect to get ${expectedLayers}, received: ${result.layers}`,
      );

      codi.assertEqual(
        result.keys,
        expectedKeys,
        `We expect to get ${expectedKeys}, received: ${result.keys}`,
      );

      codi.assertEqual(
        result.name,
        expectedName,
        `We expect to get ${expectedName}, received: ${result.name}`,
      );
    },
  );

  codi.it(
    { name: 'nested locales', parentId: 'workspace', id: 'workspace_locales' },
    async () => {
      const expectedMessage = 'Role access denied.';

      const { req, res } = codi.mockHttp.createMocks({
        params: {
          key: 'locale',
          locale: ['us', 'brand_a_locale', 'brand_b_locale', 'UK_locale'],
          user: {
            roles: ['us', 'brand_b'],
          },
        },
      });

      await getKeyMethod(req, res);

      const message = res._getData();
      const code = res.statusCode;

      codi.assertEqual(code, 400, 'We expect to get a bad request.');

      codi.assertEqual(
        message,
        expectedMessage,
        'We should get a roles denial message',
      );
    },
  );

  codi.it(
    {
      name: 'nested locales bogus roles',
      parentId: 'workspace',
      id: 'workspace_locales',
    },
    async () => {
      const expectedMessage = 'Role access denied.';
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          key: 'locale',
          locale: ['europe', 'brand_a_locale', 'brand_b_locale'],
          user: {
            roles: ['us', 'brand_b'],
          },
        },
      });

      await getKeyMethod(req, res);

      const message = res._getData();
      const code = res.statusCode;

      codi.assertEqual(code, 400, 'We expect to get a bad request.');

      codi.assertEqual(
        message,
        expectedMessage,
        'We should get a roles denial message',
      );
    },
  );

  codi.it(
    {
      name: 'nested locales bogus locale',
      parentId: 'workspace',
      id: 'workspace_locales',
    },
    async () => {
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          key: 'locale',
          locale: ['notALocale', 'anotherincorrectone', 'Idontexist'],
        },
      });

      await getKeyMethod(req, res);

      const code = res.statusCode;

      codi.assertEqual(code, 400, 'We expect to get a bad request.');
    },
  );
});
