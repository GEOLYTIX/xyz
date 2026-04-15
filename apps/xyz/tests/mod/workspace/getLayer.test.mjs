import { describe, expect, it } from 'vitest';
import checkWorkspaceCache from '@geolytix/xyz-app/mod/workspace/cache.js';
import getLayer from '@geolytix/xyz-app/mod/workspace/getLayer.js';

describe('getLayer: ', async () => {
  globalThis.xyzEnv = {
    TITLE: 'WORKSPACE TEST',
    WORKSPACE: 'file:./tests/assets/_workspace.json',
  };

  await checkWorkspaceCache(true);

  it('Get Layer from workspace', async () => {
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

  it('1. layer with role, templates with roles', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch',
      user: {
        roles: ['europe', 'scratch_role', 'scratch_role_template'],
      },
    };
    // User with 3 roles
    // Europe = locale role
    // scratch_role = layer role
    // scratch_role_template = template role on the layer

    const layer = await getLayer(params);

    // The layer key should be Scratch to ensure we got the correct layer
    expect(layer.key === 'Scratch').toBeTruthy();
    // The layer name should be SCRATCH ROLE TEMPLATE from the template with role
    expect(layer.name === 'SCRATCH ROLE TEMPLATE').toBeTruthy();
  });

  it('2. layer without role, templates with roles', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch_no_role',
      user: {
        roles: ['europe', 'scratch_role_template'],
      },
    };
    // User with 2 roles
    // Europe = locale role
    // scratch_role_template = template role on the layer

    const layer = await getLayer(params);

    // The layer key should be Scratch_no_role to ensure we got the correct layer
    expect(layer.key === 'Scratch_no_role').toBeTruthy();
    // The layer name should be SCRATCH ROLE TEMPLATE from the template with role
    expect(layer.name === 'SCRATCH ROLE TEMPLATE').toBeTruthy();
  });

  it('3. layer without role, templates without roles', async () => {
    const params = {
      locale: 'europe',
      layer: 'Scratch_no_role',
      user: {
        roles: ['europe'],
      },
    };
    // User with 1 role
    // Europe = locale role
    const layer = await getLayer(params);
    // The layer key should be Scratch_no_role to ensure we got the correct layer
    expect(layer.key === 'Scratch_no_role').toBeTruthy();
    // The layer name should be SCRATCH NO ROLE TEMPLATE from the template without role
    expect(layer.name === 'SCRATCH NO ROLE TEMPLATE').toBeTruthy();
  });
});
