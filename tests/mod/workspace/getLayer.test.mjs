import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getLayer from '../../../mod/workspace/getLayer.js';

describe('getLayer: ', async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
  };

  await checkWorkspaceCache(true);

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
    expect(layer.dbs === 'XYZ').toBeTruthy();
  });
});
