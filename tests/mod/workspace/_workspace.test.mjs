import getKeyMethod from '../../../mod/workspace/_workspace.js';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

await codi.describe({ name: 'workspace:', id: 'workspace' }, async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
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

      for (const testMethod of testMethods) {
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
      }
    },
  );
});

await codi.describe(
  {
    name: 'workspace: w/ Nested Locales & Roles',
    id: 'workspace_nested_locales',
  },
  async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/nested_roles/workspace.json',
    };

    //Calling the cache method with force to reload a new workspace
    await checkWorkspaceCache(true);

    await codi.it(
      {
        name: 'nested locales w/ Nested Roles',
        parentId: 'workspace_nested_locales',
        id: 'workspace_locales',
      },
      async () => {
        const expectedRoles = [
          'brand_a',
          'brand_b',
          'coremarkets',
          'germany',
          'germany.globalvista',
          'germany.globalvista.brand_a',
          'germany.globalvista.brand_b',
          'globalvista',
          'OBJ_ROLE',
          'TEMPLATE_ROLE',
          'uk',
          'uk.coremarkets',
          'uk.coremarkets.brand_a',
          'uk.coremarkets.brand_b',
          'uk.globalvista',
          'uk.globalvista.brand_a',
          'uk.globalvista.brand_b',
          'uk.OBJ_ROLE',
          'uk.TEMPLATE_ROLE',
        ];
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'roles',
            detail: false,
            user: {
              admin: true,
            },
          },
        });

        await getKeyMethod(req, res);

        const roles = res._getData();

        codi.assertEqual(
          roles,
          expectedRoles,
          'We expect the workspace to have the nested roles defined',
        );
      },
    );

    await codi.it(
      {
        name: 'Access Nested Locale with Combined Role',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_locale_access',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'locale',
            locale: ['germany', 'globalvista_template'],
            user: {
              roles: ['germany.globalvista'],
            },
          },
        });

        await getKeyMethod(req, res);

        const code = res.statusCode;

        codi.assertEqual(code, 200, 'Should return 200 OK');
      },
    );

    await codi.it(
      {
        name: 'Check Access to Unrelated Locale',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_locale_access_unrelated',
      },
      async () => {
        // User has access to UK -> coremarkets -> brand_b
        // But requests Germany
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'locales', // Requesting list of locales
            user: {
              roles: ['uk.coremarkets.brand_b'],
            },
          },
        });

        await getKeyMethod(req, res);

        const locales = res._getData();
        const code = res.statusCode;

        codi.assertEqual(code, 200, 'Should return 200 OK');

        // Germany should NOT be in the list
        const germany = locales.find((l) => l.key === 'germany');
        codi.assertTrue(
          !germany,
          'Germany should not be visible to user with UK role',
        );

        // UK should not be in the list
        const uk = locales.find((l) => l.key === 'uk');
        codi.assertTrue(!uk, 'UK should be hidden to user with nested role');
      },
    );

    await codi.it(
      {
        name: 'Nested Locale Layer Inheritance',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_layer_inheritance',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'locale',
            locale: ['germany', 'globalvista_template'],
            layers: true,
            user: {
              roles: ['germany.globalvista'],
            },
          },
        });

        await getKeyMethod(req, res);

        const locale = JSON.parse(res._getData());

        // Should have OSM_GERMANY (from parent) and OSM_GLOBALVISTA (from child)
        const layerKeys = locale.layers.map((l) => l.key);

        codi.assertTrue(
          layerKeys.includes('OSM_GERMANY'),
          'Should include parent layer OSM_GERMANY',
        );
        codi.assertTrue(
          layerKeys.includes('OSM_GLOBALVISTA'),
          'Should include child layer OSM_GLOBALVISTA',
        );
      },
    );

    await codi.it(
      {
        name: 'Anonymous Access to Restricted Locale',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_locale_access_anon',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'locale',
            locale: 'germany',
            user: {}, // No roles
          },
        });

        await getKeyMethod(req, res);

        const code = res.statusCode;
        codi.assertEqual(code, 400, 'Should return 400 Access Denied');
        codi.assertEqual(res._getData(), 'Role access denied.');
      },
    );

    await codi.it(
      {
        name: 'Anonymous Access to Restricted Layer',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_layer_access_anon',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'layer',
            layer: 'OSM_GERMANY',
            locale: 'germany',
            user: {},
          },
        });

        await getKeyMethod(req, res);

        const code = res.statusCode;
        codi.assertEqual(code, 400, 'Should return 400 Access Denied');
      },
    );

    await codi.it(
      {
        name: 'Authorized User Accessing Inherited Role Layer',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_layer_access_auth',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'layer',
            layer: 'OSM_GERMANY',
            locale: 'germany',
            user: {
              roles: ['germany'],
            },
          },
        });

        await getKeyMethod(req, res);

        const code = res.statusCode;
        codi.assertEqual(code, 200, 'Should return 200 OK');
      },
    );

    await codi.it(
      {
        name: 'Hidden Parent in Locales List',
        parentId: 'workspace_nested_locales',
        id: 'workspace_nested_hidden_parent',
      },
      async () => {
        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'locales',
            user: {
              roles: ['germany.globalvista'],
            },
          },
        });

        await getKeyMethod(req, res);

        const locales = res._getData();
        const code = res.statusCode;

        codi.assertEqual(code, 200, 'Should return 200 OK');

        // Germany should be hidden (traversal only, not target)
        const germany = locales.find((l) => l.key === 'germany');
        codi.assertTrue(
          !germany,
          'Germany should be hidden for user with nested-only access',
        );
      },
    );
  },
);
