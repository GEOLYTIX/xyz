import { describe, expect, it } from 'vitest';
import composeObj from '../../../mod/workspace/composeObj.js';

globalThis.xyzEnv = {
  WORKSPACE: 'file:./tests/assets/_workspace.json',
};

describe('composeObj', async () => {
  it('get layer with template from workspace', async () => {
    const obj = {
      template: {
        src: 'file:./tests/assets/layers/template_test/layer.json',
      },
    };

    const layer = await composeObj(obj);

    expect(Object.hasOwn(layer, 'style')).toBeTruthy();
  });

  it('object with bogus template', async () => {
    const obj = {
      template: 'bogus',
    };

    const response = await composeObj(obj);

    expect(response instanceof Error).toBeTruthy();
  });

  it('object with nested object template string', async () => {
    const obj = {
      nested: {
        template: 'bogus',
      },
    };

    const response = await composeObj(obj);

    expect(response.nested.template).toBeTruthy();
  });

  it('object with nested object bogus template property', async () => {
    const obj = {
      nested: {
        template: {
          src: 'bogus',
        },
      },
    };

    const response = await composeObj(obj);

    expect(response.nested.template.warn.length).toEqual(1);
  });

  it('object with nested object templates property not an array', async () => {
    const obj = {
      nested: {
        templates: 'not an array',
      },
    };

    const response = await composeObj(obj);

    expect(response.nested.warn.length).toEqual(1);
  });

  it('exclude_props in layer.template', async () => {
    const obj = {
      template: {
        src: 'file:./tests/assets/layers/template_test/layer.json',
        exclude_props: ['style'],
      },
    };

    const layer = await composeObj(obj);

    expect(Object.hasOwn(layer, 'style')).toBeFalsy();
  });

  it('include_props in layer.template', async () => {
    const obj = {
      template: {
        src: 'file:./tests/assets/layers/template_test/layer.json',
        include_props: ['style'],
      },
    };

    const layer = await composeObj(obj);

    expect(Object.hasOwn(layer, 'style')).toBeTruthy();
  });

  it('roles object without roles', async () => {
    const obj = {
      root: true,
      roles: {
        foo: null,
      },
    };

    const response = await composeObj(obj);

    expect(response instanceof Error).toBeTruthy();
  });

  it('nested templates with roles object without roles', async () => {
    const obj = {
      root: true,
      templates: [
        {
          roles: {
            foo: null,
          },
        },
      ],
    };

    const response = await composeObj(obj);

    expect(response.warn?.length === 1).toBeTruthy();
  });

  it('nested roles object without roles', async () => {
    const obj = {
      root: true,
      nested: {
        nested: true,
        roles: {
          foo: null,
        },
      },
    };

    const response = await composeObj(obj);

    expect(response.root).toBeTruthy();
    expect(response.nested).toBeFalsy();
  });

  it('array with roles object without roles', async () => {
    const obj = {
      root: true,
      arr: [
        {
          arr: 'first',
          roles: {
            first: null,
          },
        },
        {
          arr: 'second',
          roles: {
            second: null,
          },
        },
      ],
    };

    const no_roles = await composeObj(obj);

    expect(no_roles.root).toBeTruthy();
    expect(no_roles.arr.length === 0).toBeTruthy();
  });

  it('roles object with roles', async () => {
    const obj = {
      roles: {
        foo: {
          check: true,
        },
      },
    };

    const with_roles = await composeObj(obj, ['foo']);

    expect(with_roles.check === true).toBeTruthy();
  });

  it('* accessRole', async () => {
    const obj = {
      roles: {
        '*': {
          check: true,
        },
      },
    };

    const with_roles = await composeObj(obj, ['foo']);

    expect(with_roles.check === true).toBeTruthy();
  });

  it('merge roles in template', async () => {
    const obj = {
      roles: {
        foo: null,
      },
      template: {
        src: 'file:./tests/assets/layers/template_test/roles_object.json',
      },
    };

    // Access to the layer should be granted because the user has the "foo" role.
    const layer = await composeObj(obj, ['foo', 'alpha']);

    expect(layer.name === 'Test Alpha').toBeTruthy();
    expect(layer.infoj.length).toEqual(1);
  });

  it('obj with nested templates in template and roles', async () => {
    const obj = {
      parentRoles: ['locale', undefined],
      template: {
        src: 'file:./tests/assets/layers/template_test/nested_templates.json',
      },
    };

    const roles = [
      'locale',
      'locale.layer_a',
      'locale.layer_a.draw_point',
      'locale.layer_a.draw_circle',
    ];

    const layer = await composeObj(obj, roles);

    expect(layer.draw?.point).toBeTruthy();
    expect(layer.draw?.circle).toBeTruthy();
    expect(layer.err?.length === 1).toBeTruthy();
  });

  it('templates with 4 levels of nesting with roles', async () => {
    const obj = {
      parentRoles: ['locale'],
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

    const layer = await composeObj(obj, roles);

    expect(layer.draw?.point).toBeTruthy();
    expect(layer.draw?.circle).toBeTruthy();
    expect(layer.name === 'Nested Draw Point').toBeTruthy();
  });

  it('roles object with roles which do not match the accessRoles', async () => {
    const obj = {
      root: true,
      restricted: 'restricted value',
      roles: {
        access_role: true,
      },
    };

    // The user holds a role but not one of the accessRoles in the roles object.
    const response = await composeObj(obj, ['some_other_role']);

    expect(response instanceof Error).toBeTruthy();
  });

  it('nested roles object with roles which do not match the accessRoles', async () => {
    const obj = {
      root: true,
      nested: {
        restricted: 'restricted value',
        roles: {
          admin: true,
        },
      },
    };

    // The user holds a role but not one of the accessRoles in the nested roles object.
    const response = await composeObj(obj, ['some_other_role']);

    expect(response.root).toBeTruthy();
    expect(response.nested).toBeFalsy();
  });

  it('nested roles object with query template', async () => {
    const obj = {
      classList: 'expanded',
      hover: {
        template: {
          key: 'oppscan_hover',
          src: '${CLIENT}/italy/queries/oppscan_dt_hover.sql',
        },
        roles: {
          Franchisee: {
            query: 'oppscan_hover_franchisee',
            display: true,
            hidden: true,
            template: {
              key: 'oppscan_hover_franchisee',
              src: '${TEMPLATES}/yum/tools/find_opportunity/queries/oppscan_hover_franchisee.sql',
            },
          },
        },
        query: 'oppscan_hover',
        hidden: true,

        display: true,
      },
    };

    // The user holds a role but not one of the accessRoles in the nested roles object.
    const response = await composeObj(obj, ['Franchisee']);

    expect(response.hover.query).toEqual('oppscan_hover_franchisee');
    expect(response.hover.template).toBeFalsy();
  });

  it('templates nested in templates modifying an array of objects', async () => {
    // The template adds one additional entry to the infoj from a nested templates array.
    // The templates array on the object itself adds another additional entry to the infoj array, so the final infoj array should have 4 entries (as the original has 2 entries).
    const obj = {
      template: {
        src: 'file:./tests/assets/layers/template_test/layer_with_nested_templates.json',
      },
      templates: [
        {
          src: 'file:./tests/assets/layers/template_test/layer_with_nested_templates_infoj_addition_two.json',
        },
      ],
    };
    // The user holds a role but not one of the accessRoles in the nested roles object.
    const response = await composeObj(obj);

    // Expect the obj.infoj to have a length of 4.
    expect(response.infoj.length).toEqual(4);
    // Expect a field of name addition_one to be present in the infoj array.
    expect(
      response.infoj.some((item) => item.field === 'addition_one'),
    ).toBeTruthy();
    // Expect a field of name addition_two to be present in the infoj array.
    expect(
      response.infoj.some((item) => item.field === 'addition_two'),
    ).toBeTruthy();
  });
});
