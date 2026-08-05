import checkWorkspaceCache from '@geolytix/xyz-app/mod/workspace/cache.js';
import getLayer from '@geolytix/xyz-app/mod/workspace/getLayer.js';
import { describe, expect, it } from 'vitest';

describe('getLayer: ', async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
    SRC_TEST: 'file:./test/',
    LEGACY_ROLES: true,
  };

  await checkWorkspaceCache(true);

  it('invalid layer name', async () => {
    const params = {
      locale: 'europe',
      layer: '£$%',
      user: {
        roles: [
          'europe', // locale role
        ],
      },
    };
    const layer = await getLayer(params);
    expect(layer instanceof Error).toBeTruthy();
  });

  it('locale role only', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch_no_role',
      user: {
        roles: [
          'europe', // locale role
        ],
      },
    };
    const layer = await getLayer(params);
    expect(layer.key === 'Scratch_no_role').toBeTruthy();
    expect(layer.name === 'SCRATCH NO ROLE TEMPLATE').toBeTruthy();
  });

  it('locale and template role', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch_no_role',
      user: {
        roles: [
          'europe', // locale role
          'scratch_role_template', // template role
        ],
      },
    };

    const layer = await getLayer(params);

    expect(layer.key === 'Scratch_no_role').toBeTruthy();
    expect(layer.name === 'SCRATCH ROLE TEMPLATE').toBeTruthy();
  });

  it('locale and layer role', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch',
      user: {
        roles: [
          'europe', // locale role
          'scratch_role', // layer role
        ],
      },
    };

    const layer = await getLayer(params);

    expect(layer.key === 'Scratch').toBeTruthy();
    expect(layer.name === 'SCRATCH NO ROLE TEMPLATE').toBeTruthy();
    expect(layer.queryparams.locale === 'uk').toBeTruthy();
  });

  it('locale and layer without role', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch',
      user: {
        roles: [
          'europe', // locale role
        ],
      },
    };

    const layer = await getLayer(params);

    expect(layer instanceof Error).toBeTruthy();
  });

  it('layer with plugins', async () => {
    const params = {
      layer: 'plugins_layer',
    };

    const layer = await getLayer(params);

    expect(layer.plugins).toEqual(['file:./test/plugin.js']);
  });

  it('locale, layer, and template role', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch',
      user: {
        roles: [
          'europe', // locale role
          'scratch_role', // layer role
          'scratch_role_template', // template role
        ],
      },
    };

    const layer = await getLayer(params);

    expect(layer.key === 'Scratch').toBeTruthy();
    expect(layer.name === 'SCRATCH ROLE TEMPLATE').toBeTruthy();
    expect(layer.template.warn).toBeTruthy();
  });

  it('template_layer without roles', async () => {
    const params = {
      layer: 'template_layer',
    };
    const layer = await getLayer(params);
    expect(layer.key === 'template_layer').toBeTruthy();
    expect(layer.name === 'SCRATCH NO ROLE TEMPLATE').toBeTruthy();
    expect(layer.locale_layer === true).toBeTruthy();
  });

  it('template layer non existe', async () => {
    const params = {
      layer: 'bogus_template_layer',
    };
    const layer = await getLayer(params);
    expect(layer instanceof Error).toBeTruthy();
  });
});
