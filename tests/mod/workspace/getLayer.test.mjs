import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getLayer from '../../../mod/workspace/getLayer.js';

describe('getLayer: ', async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
  };

  await checkWorkspaceCache(true);

  // TODO split duplicate layers and exclude include properties test
  // @simon-leech
  it('duplicate layer with include/exclude properties', async () => {
    const params = {
      locale: 'locale',
      layer: 'OSM_Layer',
      user: {
        email: 'test@test.com',
        admin: true,
      },
      ignoreRoles: true,
    };

    const layer = await getLayer(params);

    params.layer = 'OSM_Duplicate';
    const layer_2 = await getLayer(params);

    //Check for if we have excluded props
    expect(Object.hasOwn(layer, 'attribution')).toBeFalsy();
    expect(Object.hasOwn(layer, 'format')).toBeFalsy();
    expect(Object.hasOwn(layer, 'URI')).toBeFalsy();

    //Check for if we have include props
    expect(Object.hasOwn(layer_2, 'attribution')).toBeTruthy();
    expect(Object.hasOwn(layer_2, 'display')).toBeTruthy();
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
          'scratch_role_template' // template role
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
          'scratch_role' // layer role
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
          'scratch_role_template' // template role
        ],
      },
    };

    const layer = await getLayer(params);

    expect(layer.key === 'Scratch').toBeTruthy();
    expect(layer.name === 'SCRATCH ROLE TEMPLATE').toBeTruthy();
  });
});
