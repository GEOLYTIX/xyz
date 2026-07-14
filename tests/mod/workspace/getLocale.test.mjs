import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getLocale from '../../../mod/workspace/getLocale.js';

describe('getLocale', async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
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

  it('locale with role; user with roles', async () => {
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

    expect(locale.layers.Scratch).toBeTruthy();
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
        roles: ['europe.UK.scratch_role'],
      },
    };

    const locale = await getLocale(params);

    expect(locale.layers.Scratch).toBeTruthy();
  });
});
