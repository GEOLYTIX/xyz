import { createMocks } from 'node-mocks-http';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import getKeyMethod from '../../../mod/workspace/_workspace.js';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

//Assigning console.error to a property to restore original function with.
const originalConsole = console.error;

//erros from test so we can assert on them and not get polute the console.
const mockErrors = [];

beforeAll(() => {
  //Changing the console.error function to push to our local collection of messages.
  console.error = (message) => {
    mockErrors.push(message);
  };
});

afterAll(() => {
  console.error = originalConsole;
});

describe('workspace', () => {
  it('should throw error if workspace is not accessible', async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:bar.json',
    };

    const workspace = await checkWorkspaceCache(true);

    expect(workspace.error === true).toBeTruthy();
  });
});

describe('getKeyMethod', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
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

  it('scopes without admin privileges', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'scopes',
      },
    });

    await getKeyMethod(req, res);

    expect(res.statusCode).toEqual(403);
  });

  it('Invalid key param', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'foo',
      },
    });

    await getKeyMethod(req, res);

    expect(res.statusCode).toEqual(400);
  });
});

describe('workspace: locale only', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/workspace_locale.json',
    };

    await checkWorkspaceCache(true);
  });

  it('empty roles array', async () => {
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

    expect(roles.length).toEqual(0);
  });
});

describe('workspace: roles_object_workspace', () => {
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

describe('workspace: sibling_workspace', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/nested_roles/sibling_workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  it('scopes: nested locale roles should not leak into sibling templates', async () => {
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

describe('workspace: nested_roles/workspace', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/nested_roles/workspace.json',
    };

    await checkWorkspaceCache(true);
  });

  it('scopes: nested locales with nested roles', async () => {
    const expectedRoles = [
      'germany',
      'germany.another_role',
      'germany.globalvista',
      'germany.globalvista.OBJ_ROLE',
      'germany.globalvista.TEMPLATE_ROLE',
      'germany.TEMPLATE_ROLE',
      'OBJ_ROLE',
      'TEMPLATE_ROLE',
      'uk',
      'uk.coremarkets',
      'uk.coremarkets.brand_a',
      'uk.coremarkets.brand_a.OBJ_ROLE',
      'uk.coremarkets.brand_a.TEMPLATE_ROLE',
      'uk.coremarkets.brand_b',
      'uk.coremarkets.brand_b.OBJ_ROLE',
      'uk.coremarkets.brand_b.TEMPLATE_ROLE',
      'uk.coremarkets.OBJ_ROLE',
      'uk.coremarkets.TEMPLATE_ROLE',
      'uk.globalvista',
      'uk.globalvista.OBJ_ROLE',
      'uk.globalvista.TEMPLATE_ROLE',
      'uk.OBJ_ROLE',
      'uk.TEMPLATE_ROLE',
      'uk.test',
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

  it('scopes: nested locales with nested roles treeview', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'scopes',
        tree: true,
        user: {
          admin: true,
        },
      },
    });

    const expectedRolesTree = {
      germany: {
        TEMPLATE_ROLE: {},
        another_role: {},
        globalvista: {
          OBJ_ROLE: {},
          TEMPLATE_ROLE: {},
        },
      },
      uk: {
        globalvista: {
          OBJ_ROLE: {},
          TEMPLATE_ROLE: {},
        },
        coremarkets: {
          OBJ_ROLE: {},
          TEMPLATE_ROLE: {},
          brand_a: {
            OBJ_ROLE: {},
            TEMPLATE_ROLE: {},
          },
          brand_b: {
            OBJ_ROLE: {},
            TEMPLATE_ROLE: {},
          },
        },
        OBJ_ROLE: {},
        TEMPLATE_ROLE: {},
        test: {},
      },
      OBJ_ROLE: {},
      TEMPLATE_ROLE: {},
    };

    await getKeyMethod(req, res);

    const scopesTree = res._getData();

    expect(JSON.stringify(scopesTree)).toBe(JSON.stringify(expectedRolesTree));
  });

  it('locale: anonymous access denied for restricted locale', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locale',
        locale: 'germany',
      },
    });

    await getKeyMethod(req, res);

    expect(res.statusCode).toEqual(400);
  });

  it('layer: anonymous access denied for restricted layer', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'layer',
        layer: 'OSM_GERMANY',
        locale: 'germany',
      },
    });

    await getKeyMethod(req, res);

    expect(res.statusCode).toEqual(400);
  });

  it('layer: authorized user accessing inherited role layer', async () => {
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

    expect(res.statusCode).toEqual(200);
  });

  it('locales: access to parent with nested role', async () => {
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

    expect(locales.find((l) => l.key === 'germany')).toBeTruthy();
    expect(locales.find((l) => l.key === 'uk')).toBeFalsy();
  });

  it('locales: list for restricted locales; user with nested role', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locales', // Requesting list of locales
        user: {
          roles: ['uk.coremarkets.brand_b'],
        },
      },
    });

    await getKeyMethod(req, res);

    const locale = res._getData();

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

    expect(expectedLocales).toEqual(locale);

    // Germany should NOT be in the list
    const germany = locale.find((l) => l.key === 'germany');
    expect(!germany).toBeTruthy();
  });

  it('locales: list nested locales in restricted locale without roles', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locales',
        locale: 'uk',
      },
    });

    await getKeyMethod(req, res);

    expect(res.statusCode).toEqual(400);
  });

  it('locales: list nested locales', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locales',
        locale: 'uk',
        user: {
          roles: ['uk.coremarkets'],
        },
      },
    });

    await getKeyMethod(req, res);

    const locales = res._getData();

    expect(Array.isArray(locales)).toBeTruthy();
    expect(
      locales.find((locale) => locale.key === 'uk,coremarkets_template'),
    ).toBeTruthy();
    expect(
      locales.find((locale) => locale.key === 'uk,no_role_locale'),
    ).toBeTruthy();
  });

  it('locales: list nested locales where there are none', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locales',
        locale: 'uk,globalvista_template',
        user: {
          roles: ['uk.globalvista'],
        },
      },
    });

    await getKeyMethod(req, res);

    const locales = res._getData();

    expect(locales.length === 0).toBeTruthy();
  });

  it('locales: list nested locales in nested locale', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'locales',
        locale: 'uk,coremarkets_template',
        user: {
          roles: ['uk.coremarkets'],
        },
      },
    });

    await getKeyMethod(req, res);

    const locales = res._getData();

    // no accessible nested locales in coremarkets_template
    expect(locales.length === 0).toBeTruthy();
  });

  it('locale: should not see a locale without the correct role', async () => {
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

it('test admin access', async () => {
  const { req, res } = createMocks({
    params: {
      key: 'test',
    },
  });

  await getKeyMethod(req, res);

  res._getData();

  expect(res.statusCode).toEqual(403);
});

describe('workspace: errs', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/test_workspace.json',
      CUSTOM_TEMPLATES: 'missing_file.json',
    };

    await checkWorkspaceCache(true);
  });

  it('test: template errors and composition warnings', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'test',
        user: {
          admin: true,
        },
      },
    });

    await getKeyMethod(req, res);

    const testResult = res._getData();

    expect(testResult.negatedRoles.length).toEqual(2);

    expect(testResult.negatedRoles).toEqual(
      testResult.negatedRoles.sort((a, b) => a.localeCompare(b)),
    );

    expect(testResult.srcErr.length).toEqual(3);

    expect(testResult.srcErr).toEqual(
      testResult.srcErr.sort((a, b) => a.localeCompare(b)),
    );

    expect(testResult.templateWarn.length).toEqual(2);

    expect(testResult.templateWarn).toEqual(
      testResult.templateWarn.sort((a, b) => a.localeCompare(b)),
    );
  });

  it('compose workspace denied', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'compose',
      },
    });

    await getKeyMethod(req, res);

    res._getData();

    expect(res.statusCode).toEqual(403);
  });

  it('compose workspace locales', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'compose',
        user: {
          admin: true,
        },
      },
    });

    await getKeyMethod(req, res);

    const composedWorkspace = res._getData();

    expect(Object.keys(composedWorkspace.locales).length).toEqual(3);
  });

  it('Gone roles', async () => {
    const { req, res } = createMocks({
      params: {
        key: 'roles',
      },
    });

    await getKeyMethod(req, res);

    res._getData();

    expect(res.statusCode).toEqual(410);
  });
});
