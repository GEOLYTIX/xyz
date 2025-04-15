import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getKeyMethod from '../../../mod/workspace/_workspace.js';

await codi.describe({ name: 'workspace:', id: 'workspace' }, async () => {
  globalThis.xyzEnv = {
    TITLE: 'A DIFFERENT TITLE',
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
      const expectedLocale = `{"layers":["OSM","brand_a_layer","brand_b_layer"],"extent":{},"key":["europe","brand_a_locale","brand_b_locale"],"name":"europe/brand_a_locale/brand_b_locale","workspace":"A DIFFERENT TITLE","keys":["europe","brand_a_locale","brand_b_locale"],"_type":"workspace"}`;
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

      const result = res._getData();

      codi.assertEqual(result, expectedLocale);
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
