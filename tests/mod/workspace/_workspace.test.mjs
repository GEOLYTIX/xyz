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
      const { req, res } = codi.mockHttp.createMocks({
        params: {
          key: 'locale',
          locales: ['us', 'brand_a_locale'],
          user: {
            roles: ['us', 'brand_a'],
          },
        },
      });

      await getKeyMethod(req, res);

      //console.log(res._getData());
    },
  );
});
