import checkWorkspaceCache from '@geolytix/xyz-app/mod/workspace/cache.js';
import getLocale from '@geolytix/xyz-app/mod/workspace/getLocale.js';
import { describe, expect, it } from 'vitest';

describe('getLocale', async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
    LEGACY_ROLES: true,
  };

  await checkWorkspaceCache(true);

  it('locale no existe', async () => {
    const params = {
      locale: 'no_existe',
    };

    const locale = await getLocale(params);

    expect(locale instanceof Error).toBeTruthy();
  });

  it('locale with role; no user', async () => {
    const params = {
      locale: {
        template: {
          key: 'locale_a',
          src: 'file:./tests/assets/layers/template_test/locale.json',
        },
      },
    };

    const locale = await getLocale(params);

    expect(locale instanceof Error).toBeTruthy();
  });

  it('locale as string with role; user with roles', async () => {
    const params = {
      locale: 'uk',
      user: {
        roles: ['uk'],
      },
    };

    const locale = await getLocale(params);

    expect(locale.key === 'uk').toBeTruthy();
    // This default locale with the OSM layer has been merged into the UK locale which has no layers.
    expect(locale.layers.OSM).toBeTruthy();
  });

  it('locale as object with template with role; user with roles', async () => {
    const params = {
      locale: {
        template: {
          key: 'locale_a',
          src: 'file:./tests/assets/layers/template_test/locale.json',
        },
      },
      user: {
        roles: ['locale'],
      },
    };

    const locale = await getLocale(params);

    expect(locale.key === 'locale_a').toBeTruthy();
  });

  it('locale as object with 2 templates with role; user with roles; user only has permission to one', async () => {
    const params = {
      layers: true,
      locale: {
        key: 'locale_a',
        template: {
          src: 'file:./tests/assets/layers/template_test/locale_two_layers_roles.json',
        },
      },
      user: {
        roles: ['Super'],
      },
    };

    const locale = await getLocale(params);

    // Expect locale.layers to contain a layer with the key 'layer' and not contain a layer with the key 'layer_b'
    expect(locale.layers.layer).toBeTruthy();
    expect(locale.layers.layer_b).toBeFalsy();
  });

  it('nested locales with role[s]; user with first level role', async () => {
    const params = {
      locale: ['europe', 'UK_locale'],
      user: {
        roles: ['europe'],
      },
    };

    const locale = await getLocale(params);

    expect(locale instanceof Error).toBeTruthy();
  });

  it('nested locales with role[s]; user with roles array', async () => {
    const params = {
      locale: ['europe', 'UK_locale'],
      user: {
        roles: ['europe', 'UK'],
      },
    };

    const locale = await getLocale(params);

    expect(locale.name === 'europe/UK_locale').toBeTruthy();
  });

  it('nested locales with layers and role[s]; user with roles array', async () => {
    const params = {
      locale: ['europe', 'UK_locale'],
      layers: true,
      user: {
        roles: ['europe', 'UK', 'scratch_role'],
      },
    };

    const locale = await getLocale(params);

    expect(locale.layers.some((layer) => layer.key === 'Scratch')).toBeTruthy();
    expect(
      locale.layers.some((layer) => layer.key === 'restricted'),
    ).toBeFalsy();
  });

  it('nested locales with role[s]; user with nested role string', async () => {
    const params = {
      locale: ['europe', 'UK_locale'],
      user: {
        roles: ['europe.UK'],
      },
    };

    const locale = await getLocale(params);

    expect(locale.name === 'europe/UK_locale').toBeTruthy();
  });

  it('nested locales with layers and role[s]; user with nested role string', async () => {
    const params = {
      locale: ['europe', 'UK_locale'],
      layers: true,
      user: {
        roles: ['europe.UK.scratch_role.scratch_role_template'],
      },
    };

    const locale = await getLocale(params);

    const osmLayer = locale.layers.find((layer) => layer.key === 'OSM');
    expect(osmLayer.template.warn).toBeTruthy();

    const scratchLayer = locale.layers.find((layer) => layer.key === 'Scratch');

    expect(scratchLayer.name === 'SCRATCH ROLE TEMPLATE').toBeTruthy();
    expect(scratchLayer.template.warn).toBeTruthy();
  });
});
