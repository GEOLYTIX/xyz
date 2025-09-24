await codi.describe(
  {
    name: 'mergeTemplates',
    id: 'workspace_mergeTemplates',
    parentId: 'workspace',
  },
  async () => {
    globalThis.xyzEnv = {
      TITLE: 'TITLE',
      WORKSPACE: 'file:./tests/assets/workspace_locale_layers_templates.json',
    };

    await codi.it(
      {
        name: 'get template from workspace',
        parentId: 'workspace_getTemplate',
      },
      async () => {
        const obj = {
          template: {
            src: 'file:./tests/assets/layers/template_test/layer.json',
          },
          exclude_props: ['style'],
        };

        const { default: mergeTemplates } = await import(
          '../../../mod/workspace/mergeTemplates.js'
        );

        const template = await mergeTemplates(obj, null, false);

        codi.assertFalse(Object.hasOwn(template, 'style'));
      },
    );
  },
);
