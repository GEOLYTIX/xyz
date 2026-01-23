import getKeyMethod from '../../../mod/workspace/_workspace.js';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

await codi.describe(
  {
    name: 'getLocale',
    id: 'workspace_getLocale',
    parentId: 'workspace',
  },
  async () => {
    const { default: getLocale } = await import(
      '../../../mod/workspace/getLocale.js'
    );

    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/_workspace.json',
    };

    //Calling the cache method with force to reload a new workspace
    await checkWorkspaceCache(true);

    await codi.it(
      {
        name: 'access restricted locale',
        parentId: 'workspace_getLocale',
      },
      async () => {
        //Use a locale template which has a role on it
        //Assign a different role to the user and check whether the user gets access to the locale.
        //If the role in the locale is different the user should not get access.
        const obj = {
          user: {
            roles: ['locale_template'],
          },
          locale: {
            template: {
              key: 'locale_a',
              src: 'file:./tests/assets/layers/template_test/locale.json',
            },
          },
        };

        const template = await getLocale(obj);

        codi.assertTrue(
          template instanceof Error,
          'We would expect a roles permission error',
        );
      },
    );

    await codi.it(
      {
        name: '1. locale with role, templates with roles',
        parentId: 'workspace_getLocale',
      },
      async () => {
        // Provide the user with 3 roles
        // Europe = locale
        // scratch_role = template for layer
        // brand_c = locale template
        const params = {
          user: {
            roles: ['europe', 'scratch_role', 'brand_c'],
          },
          locale: 'europe',
        };

        let locale = await getLocale(params);

        codi.assertTrue(Object.hasOwn(locale.layers, 'Scratch'));

        params.locale = 'brand_c_locale';

        locale = await getLocale(params);

        codi.assertTrue(Object.hasOwn(locale.layers, 'brand_c_layer'));
      },
    );

    await codi.it(
      {
        name: '2. locale without role, templates with roles',
        parentId: 'workspace_getLocale',
      },
      async () => {
        // Provide the user with 1 roles
        // brand_c = locale template
        const params = {
          user: {
            roles: ['brand_c'],
          },
          locale: 'uk',
        };

        let locale = await getLocale(params);

        codi.assertTrue(locale.key === 'uk');

        params.locale = 'brand_c_locale';

        locale = await getLocale(params);

        codi.assertTrue(Object.hasOwn(locale.layers, 'brand_c_layer'));
      },
    );

    await codi.it(
      {
        name: '3. locale without role, templates without roles',
        parentId: 'workspace_getLocale',
      },
      async () => {
        // Provide the user with no roles
        // brand_a_locale = locale template without role
        const params = {
          user: {},
          locale: 'uk',
        };

        let locale = await getLocale(params);

        codi.assertTrue(locale.key === 'uk');

        params.locale = 'brand_a_locale';

        locale = await getLocale(params);

        codi.assertTrue(Object.hasOwn(locale.layers, 'brand_a_layer'));
      },
    );
  },
);
