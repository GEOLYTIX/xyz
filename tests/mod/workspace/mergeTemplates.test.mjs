import { describe, expect, it } from 'vitest';

describe('mergeTemplates', async () => {
  const { default: mergeTemplates } = await import(
    '../../../mod/workspace/mergeTemplates.js'
  );

  it('get template from workspace', async () => {
    const obj = {
      template: {
        src: 'file:./tests/assets/layers/template_test/layer.json',
        exclude_props: ['style'],
      },
    };

    const template = await mergeTemplates(obj, null, false);

    expect(Object.hasOwn(template, 'style')).toBeFalsy();
  });

  it('check roles object merge', async () => {
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

    expect(
      expectedRoles.every((r) => Object.keys(template.roles).includes(r)),
    ).toBeTruthy();

    expect(template.name === 'Test Alpha').toBeTruthy();

    expect(template.infoj.length).toEqual(2);
  });

  it('mergeTemplates with roles', async () => {
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

    await codi.it(
      {
        name: 'merge direct object roles into resolved object',
        parentId: 'workspace_mergeTemplates',
      },
      async () => {
        const layer = {
          name: 'Base name',
          filter: {
            current: {},
          },
          roles: {
            KEY_BRANDS: {
              name: 'KEY BRANDS',
              filter: {
                current: {
                  key_brands_layer: {
                    in: [true],
                  },
                },
              },
            },
          },
        };

        const result = await mergeTemplates(layer, ['KEY_BRANDS']);

        codi.assertEqual(result.name, 'KEY BRANDS');
        codi.assertEqual(result.filter.current, {
          key_brands_layer: {
            in: [true],
          },
        });
      },
    );

    await codi.it(
      {
        name: 'mergeTemplates with roles',
        parentId: 'workspace_mergeTemplates',
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
    expect(
      Object.hasOwn(template, 'draw') && Object.hasOwn(template.draw, 'point'),
    ).toBeTruthy();

    // Check template in template has the draw.circle object.
    expect(
      Object.hasOwn(template, 'draw') && Object.hasOwn(template.draw, 'circle'),
    ).toBeTruthy();

    // Check the roles object contains nested roles.
    const expectedRoles = [
      'locale.layer_a',
      'layer_a.draw_point',
      'locale.layer_a.draw_point',
      'layer_a.draw_circle',
      'locale.layer_a.draw_circle',
    ];

    expect(
      expectedRoles.every((r) => Object.keys(template.roles).includes(r)),
    ).toBeTruthy();
  });

  it('sibling templates should not leak roles into nested sub-templates', async () => {
    // Simulates a locale with role "uk" that has sibling templates:
    //   - demographics (role: "demographics")
    //   - stores (role: "stores", with sub-templates: brand_a)
    // brand_a should combine with stores roles, NOT with demographics roles.
    const obj = {
      role: 'uk',
      templates: [
        {
          role: 'demographics',
          meta: 'demographics template',
        },
        {
          role: 'stores',
          meta: 'stores template',
          templates: [
            {
              role: 'brand_a',
              meta: 'brand_a template',
            },
          ],
        },
      ],
    };

    const roles = true; // admin - no role filtering

    const result = await mergeTemplates(obj, roles);

    const resultRoles = Object.keys(result.roles).sort();

    // brand_a should be combined with stores and uk.stores, but NOT with demographics
    expect(resultRoles.includes('stores.brand_a')).toBeTruthy();
    expect(resultRoles.includes('uk.stores.brand_a')).toBeTruthy();

    // brand_a should NOT be combined with demographics
    expect(resultRoles.includes('demographics.brand_a')).toBeFalsy();
    expect(resultRoles.includes('uk.demographics.brand_a')).toBeFalsy();
  });

  it('mergeTemplates with 4 levels nesting of roles including templates in templates', async () => {
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
    expect(
      Object.hasOwn(template, 'draw') && Object.hasOwn(template.draw, 'point'),
    ).toBeTruthy();

    // Check template in template has the draw.circle object.
    expect(
      Object.hasOwn(template, 'draw') && Object.hasOwn(template.draw, 'circle'),
    ).toBeTruthy();

    // Check template in template has the name "Nested Draw Point".
    expect(template.name === 'Nested Draw Point').toBeTruthy();

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
    expect(expectedRoles).toEqual(templateRoles);
  });
});
