import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getLayer from '../../../mod/workspace/getLayer.js';

await codi.describe(
  { name: 'getLayer: ', id: 'workspace_getLayer' },
  async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/_workspace.json',
    };

    await checkWorkspaceCache(true);

    await codi.it(
      { name: 'Get Layer from workspace', parentId: 'workspace_getLayer' },
      async () => {
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
        codi.assertFalse(Object.hasOwn(layer, 'attribution'));
        codi.assertFalse(Object.hasOwn(layer, 'format'));
        codi.assertFalse(Object.hasOwn(layer, 'URI'));

        //Check for if we have include props
        codi.assertTrue(Object.hasOwn(layer_2, 'attribution'));
        codi.assertTrue(Object.hasOwn(layer_2, 'display'));
      },
    );

    await codi.it(
      {
        name: '1. layer with role, templates with roles',
        parentId: 'workspace_getLayer',
      },
      async () => {
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
        codi.assertTrue(layer.key === 'Scratch');
        // The layer name should be SCRATCH ROLE TEMPLATE from the template with role
        codi.assertTrue(layer.name === 'SCRATCH ROLE TEMPLATE');
      },
    );

    await codi.it(
      {
        name: '2. layer without role, templates with roles',
        parentId: 'workspace_getLayer',
      },
      async () => {
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
        codi.assertTrue(layer.key === 'Scratch_no_role');
        // The layer name should be SCRATCH ROLE TEMPLATE from the template with role
        codi.assertTrue(layer.name === 'SCRATCH ROLE TEMPLATE');
      },
    );

    await codi.it(
      {
        name: '3. layer without role, templates without roles',
        parentId: 'workspace_getLayer',
      },
      async () => {
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
        codi.assertTrue(layer.key === 'Scratch_no_role');
        // The layer name should be SCRATCH NO ROLE TEMPLATE from the template without role
        codi.assertTrue(layer.name === 'SCRATCH NO ROLE TEMPLATE');
      },
    );
  },
);
