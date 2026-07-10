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

  it('roles object without roles', async () => {
    const obj = {
      root: true,
      roles: {
        foo: null,
      },
    };

    const no_roles = await composeObj(obj);

    expect(no_roles instanceof Error).toBeTruthy();
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

    const no_roles = await composeObj(obj);

    expect(no_roles.root).toBeTruthy();
    expect(Array.isArray(no_roles.err)).toBeTruthy();
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

  it('obj with template and nested roles', async () => {
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
      'locale.layer_a.draw_circle',
    ];

    const layer = await composeObj(obj, roles);

    expect(layer.draw?.point).toBeTruthy();
    expect(layer.draw?.circle).toBeTruthy();
  });

  it('templates with 4 levels of nesting with roles', async () => {
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

    const layer = await composeObj(obj, roles);

    expect(layer.draw?.point).toBeTruthy();
    expect(layer.draw?.circle).toBeTruthy();
    expect(layer.name === 'Nested Draw Point').toBeTruthy();
  });
});
