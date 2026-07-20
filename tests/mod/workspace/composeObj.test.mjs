import { describe, expect, it } from 'vitest';
import composeObj from '../../../mod/workspace/composeObj.js';

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

  it('object with nested object template object', async () => {
    const obj = {
      nested: {
        template: {
          src: 'bogus',
        },
      },
    };

    const response = await composeObj(obj);

    expect(response.nested.template.warn).toBeTruthy();
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

    expect(response.err?.length === 1).toBeTruthy();
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
    expect(Array.isArray(response.err)).toBeTruthy();
  });

  it('array with roles object without roles', async () => {
    const obj = {
      root: true,
      arr: [
        {
          arr: true,
          roles: {
            foo: null,
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
    expect(layer.infoj.length).toEqual(2);
  });

  it('obj with nested templates in template and roles', async () => {
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
      'locale.layer_a.draw_circle',
    ];

    const layer = await composeObj(obj, roles);

    expect(layer.draw?.point).toBeTruthy();
    expect(layer.draw?.circle).toBeTruthy();
    expect(layer.err?.length === 3).toBeTruthy();
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
});
