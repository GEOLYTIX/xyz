await codi.describe(
  {
    name: 'mergeTemplates',
    id: 'workspace_mergeTemplates',
    parentId: 'workspace',
  },
  async () => {
    const { default: mergeTemplates } = await import(
      '../../../mod/workspace/mergeTemplates.js'
    );

    await codi.it(
      {
        name: 'get template from workspace',
        parentId: 'workspace_getTemplate',
      },
      async () => {
        const obj = {
          template: {
            src: 'file:./tests/assets/layers/template_test/layer.json',
            exclude_props: ['style'],
          },
        };

        const template = await mergeTemplates(obj, null, false);

        codi.assertFalse(Object.hasOwn(template, 'style'));
      },
    );

    await codi.it(
      {
        name: 'mergeTemplates with roles',
        parentId: 'workspace_mergeTemplates',
      },
      async () => {
        const obj = {
          localeRole: 'locale',
          role: 'layer',
          name: 'Layer Name',
          template: {
            src: 'file:./tests/assets/layers/template_test/layer.json',
            exclude_props: ['style'],
            role: 'template',
          },
          infoj: [
            {
              name: 'You should see me',
              edit: true,
              role: 'edit',
            },
          ],
        };

        const roles = ['locale', 'layer', 'template'];

        const template = await mergeTemplates(obj, roles, false);

        delete template.template;

        console.log(template);
      },
    );
  },
);
