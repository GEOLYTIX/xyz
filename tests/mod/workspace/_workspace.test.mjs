import { createMocks } from 'node-mocks-http';
import { beforeAll, describe, expect, it } from 'vitest';
import getKeyMethod from '../../../mod/workspace/_workspace.js';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

describe('getKeyMethod', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/_workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  it('layer', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'layer',
        layer: 'OSM',
      },
    });

    await getKeyMethod(req, res);

    const layer = res._getData();

    expect(layer.key === 'OSM').toBeTruthy();
  });

  it('locale', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locale',
      },
    });

    await getKeyMethod(req, res);

    const locale = res._getData();

    expect(locale.layers.OSM).toBeTruthy();
  });
});

describe('scopes: roles_object_workspace', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/roles_object_workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  it('roles objects should not create dot notation roles', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'scopes',
        user: {
          admin: true,
        },
      },
    });

    await getKeyMethod(req, res);

    const roles = res._getData();

    expect(roles).toEqual([
      'A',
      'GeoBurger',
      'GeoCoffee',
      'pol',
      'Standard',
      'Super',
      'uk',
    ]);
  });
});

describe('scopes: sibling_workspace', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/nested_roles/sibling_workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  it('nested locale roles should not leak into sibling templates', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'scopes',
        user: {
          admin: true,
        },
      },
    });

    await getKeyMethod(req, res);

    const roles = res._getData();

    const expectedRoles = [
      'uk',
      'uk.brand_a',
      'uk.brand_b',
      'uk.demographics',
      'uk.nested',
      'uk.stores',
    ];

    expect(roles).toEqual(expectedRoles);
  });
});

describe('nested_roles/workspace', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/nested_roles/workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  it('nested locales w/ Nested Roles', async () => {
    const expectedRoles = [
      'another_role',
      'brand_a',
      'brand_b',
      'coremarkets',
      'coremarkets.brand_a',
      'coremarkets.brand_b',
      'germany',
      'germany.another_role',
      'germany.globalvista',
      'germany.globalvista.TEMPLATE_ROLE',
      'germany.TEMPLATE_ROLE',
      'globalvista',
      'OBJ_ROLE',
      'TEMPLATE_ROLE',
      'test',
      'uk',
      'uk.coremarkets',
      'uk.coremarkets.brand_a',
      'uk.coremarkets.brand_b',
      'uk.globalvista',
      'uk.globalvista.TEMPLATE_ROLE',
      'uk.TEMPLATE_ROLE',
    ];

    const { req, res } = createMocks({
      params: {
        key: 'scopes',
        user: {
          admin: true,
        },
      },
    });

    await getKeyMethod(req, res);

    const roles = res._getData();

    expect(roles).toEqual(expectedRoles);
  });

  it('Check Access to Unrelated Locale', async () => {
    // User has access to UK -> coremarkets -> brand_b
    // But requests Germany
    const { req, res } = createMocks({
      params: {
        key: 'locales', // Requesting list of locales
        user: {
          roles: ['uk', 'uk.coremarkets', 'uk.coremarkets.brand_b'],
        },
      },
    });

    await getKeyMethod(req, res);

    const expectedLocales = [
      {
        key: 'uk',
        name: 'uk',
        locales: [
          'globalvista_template',
          'coremarkets_template',
          'no_role_locale',
        ],
      },
    ];

    const locales = res._getData();

    expect(expectedLocales).toEqual(locales);

    // Germany should NOT be in the list
    const germany = locales.find((l) => l.key === 'germany');
    expect(!germany).toBeTruthy();
  });

  it('Anonymous Access to Restricted Locale', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locale',
        locale: 'germany',
        user: {}, // No roles
      },
    });

    await getKeyMethod(req, res);

    const code = res.statusCode;
    expect(code).toEqual(400);
    expect(res._getData()).toEqual('Role access denied.');
  });

  it('Anonymous Access to Restricted Layer', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'layer',
        layer: 'OSM_GERMANY',
        locale: 'germany',
        user: {},
      },
    });

    await getKeyMethod(req, res);

    const code = res.statusCode;
    expect(code).toEqual(400);
  });

  it('Authorized User Accessing Inherited Role Layer', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'layer',
        layer: 'OSM_GERMANY',
        locale: 'germany',
        user: {
          roles: ['germany'],
        },
      },
    });

    await getKeyMethod(req, res);

    const code = res.statusCode;

    expect(code).toEqual(200);
  });

  it('Hidden Parent in Locales List', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locales',
        user: {
          roles: ['germany.globalvista'],
        },
      },
    });

    await getKeyMethod(req, res);

    const locales = res._getData();
    const code = res.statusCode;

    expect(code).toEqual(200);

    // Germany should be hidden (traversal only, not target)
    const germany = locales.find((l) => l.key === 'germany');
    expect(!germany).toBeTruthy();
  });

  it('Should not see a locale without the correct role', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locale',
        locale: ['germany', 'globalvista_template'],
        user: {
          roles: ['germany'],
        },
      },
    });

    await getKeyMethod(req, res);

    const code = res.statusCode;

    expect(code).toEqual(400);
  });
});
