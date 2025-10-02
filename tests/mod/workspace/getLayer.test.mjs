import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getLayer from '../../../mod/workspace/getLayer.js';

await codi.describe(
  { name: 'getLayer: ', id: 'workspace_getLayer' },
  async () => {
    globalThis.xyzEnv = {
      TITLE: 'WORKSPACE TEST',
      WORKSPACE: 'file:./tests/assets/workspace_locale_layers_include.json',
    };

    await checkWorkspaceCache(true);

    codi.it(
      { name: 'Get Layer from workspace', parentId: 'workspace_getLayer' },
      async () => {
        const params = {
          locale: 'locale',
          layer: 'OSM_Layer',
          ignoreRoles: true,
          user: {
            email: 'test@test.com',
            admin: true,
          },
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
  },
);
