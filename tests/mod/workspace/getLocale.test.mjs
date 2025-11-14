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
      WORKSPACE: 'file:./tests/assets/workspace_nested_locales_roles.json',
    };

    //Calling the cache method with force to reload a new workspace
    await checkWorkspaceCache(true);

    await codi.it(
      {
        name: 'locale with templates that has roles',
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
        name: 'locale with templates that has roles',
        parentId: 'workspace_getLocale',
      },
      async () => {
        const params = {
          user: {
            roles: ['brand_b', 'brand_c'],
          },
          locale: 'brand_b_locale',
        };

        const expectedRoles = {
          brand_b: {},
          brand_c: {},
          scratch_role: {},
          europe: {},
        };

        await getLocale(params);

        params.locale = 'brand_c_locale';

        await getLocale(params);

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            key: 'roles',
            tree: true,
            user: {
              admin: true,
            },
          },
        });

        await getKeyMethod(req, res);

        const roles = res._getData();

        codi.assertEqual(roles, expectedRoles);
      },
    );
  },
);
