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
  },
);
