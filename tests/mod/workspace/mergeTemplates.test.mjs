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
        name: 'check roles object merge',
        parentId: 'workspace_mergeTemplates',
      },
      async () => {
        const expectedRoles = ['foo', 'bar', 'alpha', 'beta'];

        const layer = {
          roles: {
            foo: null,
            bar: null,
          },
          template: {
            src: 'file:./tests/assets/layers/template_test/roles_object.json',
          },
        };

        const template = await mergeTemplates(layer, ['foo', 'alpha']);

        codi.assertTrue(
          expectedRoles.every((r) => Object.keys(template.roles).includes(r)),
          `Need to ensure all expected roles are present: ${expectedRoles.join(', ')}`,
        );

        codi.assertTrue(
          template.name === 'Test Alpha',
          'template name should match role assignment',
        );

        codi.assertEqual(
          template.infoj.length,
          2,
          'There should be two infoj entries',
        );
      },
    );

    await codi.it(
      {
        name: 'mergeTemplates with roles',
        parentId: 'workspace_mergeTemplates',
      },
      async () => {
        const expectedRoles = ['template', 'locale.layer.template'];
        const layer = {
          localeRole: 'locale',
          role: 'layer',
          template: {
            role: 'template',
            src: 'file:./tests/assets/layers/template_test/nested_roles.json',
            exclude_props: ['style'],
          },
        };

        const template = await mergeTemplates(layer, ['locale.layer.template']);

        codi.assertTrue(
          expectedRoles.every((r) => Object.keys(template.roles).includes(r)),
          `Need to ensure all expected roles are present: ${expectedRoles.join(', ')}`,
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
        // Within the nested template is two templates. One is loaded from a file that has the "role": "draw_point" and provides a draw object with different properties.
        // The other is defined inline with the "role": "draw_circle".
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

        const template = await mergeTemplates(obj, roles);

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

    await codi.it(
      {
        name: 'mergeTemplates with 4 levels nesting of roles including templates in templates',
        parentId: 'workspace_mergeTemplates',
      },
      async () => {
        // Inside the layer is a template which contains another template that is used to control whether or not the draw object is seen.
        // The nested template is a separate file that has the "role": "layer_a".
        // Within the nested template is two templates. One is loaded from a file that has the "role": "draw_point" and provides a draw object with different properties.
        // The other is defined inline with the "role": "draw_circle".
        // Inside the draw_point template is another template that provides additional properties.
        // The template nested inside draw_point is loaded from a file that has the "role": "nested_draw_point".
        const obj = {
          localeRole: 'locale',
          template: {
            src: 'file:./tests/assets/layers/template_test/nested_templates.json',
          },
        };

        const roles = [
          'locale',
          'locale.layer_a',
          'locale.layer_a.draw_point',
          'locale.layer_a.draw_point.nested_draw_point',
          'locale.layer_a.draw_circle',
        ];

        const template = await mergeTemplates(obj, roles);

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

        // Check template in template has the name "Nested Draw Point".
        codi.assertTrue(
          template.name === 'Nested Draw Point',
          'template name should be "Nested Draw Point", found: ' +
            template.name,
        );

        // Check the roles object contains nested roles.
        const expectedRoles = [
          'draw_circle',
          'draw_point',
          'draw_point.nested_draw_point',
          'layer_a',
          'layer_a.draw_circle',
          'layer_a.draw_point',
          'layer_a.draw_point.nested_draw_point',
          'locale.layer_a',
          'locale.layer_a.draw_circle',
          'locale.layer_a.draw_point',
          'locale.layer_a.draw_point.nested_draw_point',
          'nested_draw_point',
        ].sort();

        const templateRoles = Object.keys(template.roles).sort();

        // Check no other roles are present other than expected.
        codi.assertEqual(expectedRoles, templateRoles);
      },
    );
  },
);
