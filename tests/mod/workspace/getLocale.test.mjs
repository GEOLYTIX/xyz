import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

describe('getLocale', async () => {
  const { default: getLocale } = await import(
    '../../../mod/workspace/getLocale.js'
  );

  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
  };

  //Calling the cache method with force to reload a new workspace
  await checkWorkspaceCache(true);

  it('access restricted locale', async () => {
    //Use a locale template which has a role on it
    //Assign a different role to the user and check whether the user gets access to the locale.
    //If the role in the locale is different the user should not get access.
    const obj = {
      user: {
        roles: ['locale_template'],
      },
      locale: {
        template: {
          key: 'locale_a',
          src: 'file:./tests/assets/layers/template_test/locale.json',
        },
      },
    };

    const template = await getLocale(obj);

    expect(template instanceof Error).toBeTruthy();
  });

  it('1. locale with role, templates with roles', async () => {
    // Provide the user with 3 roles
    // Europe = locale
    // scratch_role = template for layer
    // brand_c = locale template
    const params = {
      user: {
        roles: ['europe', 'scratch_role', 'brand_c'],
      },
      locale: 'europe',
    };

    let locale = await getLocale(params);

    expect(Object.hasOwn(locale.layers, 'Scratch')).toBeTruthy();

    params.locale = 'brand_c_locale';

    locale = await getLocale(params);

    expect(Object.hasOwn(locale.layers, 'brand_c_layer')).toBeTruthy();
  });

  it('2. locale without role, templates with roles', async () => {
    // Provide the user with 1 roles
    // brand_c = locale template
    const params = {
      user: {
        roles: ['brand_c'],
      },
      locale: 'uk',
    };

    let locale = await getLocale(params);

    expect(locale.key === 'uk').toBeTruthy();

    params.locale = 'brand_c_locale';

    locale = await getLocale(params);

    expect(Object.hasOwn(locale.layers, 'brand_c_layer')).toBeTruthy();
  });

  it('3. locale without role, templates without roles', async () => {
    // Provide the user with no roles
    // brand_a_locale = locale template without role
    const params = {
      user: {},
      locale: 'uk',
    };

    let locale = await getLocale(params);

    expect(locale.key === 'uk').toBeTruthy();

    params.locale = 'brand_a_locale';

    locale = await getLocale(params);

    expect(Object.hasOwn(locale.layers, 'brand_a_layer')).toBeTruthy();
  });
});
