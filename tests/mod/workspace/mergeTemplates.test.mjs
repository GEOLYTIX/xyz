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
        const expectedRoles = { 'locale.layer': true };
        const obj = {
          localeRole: 'locale',
          role: 'layer',
          template: {
            role: 'template',
            src: 'file:./tests/assets/layers/template_test/nested_roles.json',
            exclude_props: ['style'],
          },
        };

        const roles = ['locale', 'locale.layer', 'locale.layer.template'];

        const template = await mergeTemplates(obj, roles, true);

        codi.assertEqual(
          expectedRoles,
          template.roles,
          `We expect to see locale, locale.layer, locale.layer.template as a role path we get: ${JSON.stringify(template.roles)}`,
        );
      },
    );

    await codi.it(
      {
        name: 'mergeTemplates with 3 levels nesting of roles',
        parentId: 'workspace_mergeTemplates',
      },
      async () => {
        // Inside the layer is a template which contains another template that is used to control whether or not the draw object is seen.
        // The nested template is a separate file that has the "role": "layer_a".
        // Within the nested template is two templates that have the "role": "draw_point" and "draw_circle" and provides a draw object with different properties.
        const obj = {
          localeRole: 'locale',
          template: {
            key: 'layer_a',
            src: 'file:./tests/assets/layers/template_test/nested_templates.json',
          },
        };

        const roles = [
          'locale',
          'locale.layer_a',
          'locale.layer_a.draw_point',
          'locale.layer_a.draw_circle',
        ];

        const template = await mergeTemplates(obj, roles, false);

        delete template.template;

        // Check template in template has the draw.point object.
        codi.assertTrue(
          Object.hasOwn(template, 'draw') &&
            Object.hasOwn(template.draw, 'point'),
          'Need to ensure draw.point is present from the merge',
        );

        // Check template in template has the draw.circle object.
        codi.assertTrue(
          Object.hasOwn(template, 'draw') &&
            Object.hasOwn(template.draw, 'circle'),
          'Need to ensure draw.circle is present from the merge',
        );

        // Check the roles object contains nested roles.
        const expectedRoles = [
          'locale.layer_a',
          'layer_a.draw_point',
          'locale.layer_a.draw_point',
          'layer_a.draw_circle',
          'locale.layer_a.draw_circle',
        ];

        codi.assertTrue(
          expectedRoles.every((r) => Object.keys(template.roles).includes(r)),
          `Need to ensure all expected roles are present: ${expectedRoles.join(', ')}`,
        );
      },
    );
  },
);
