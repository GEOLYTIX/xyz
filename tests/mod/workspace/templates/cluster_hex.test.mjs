/**
 * @module mod/workspace/templates/cluster_hex.test.mjs
 */

/**
 * @description Entry point for the cluster hex template module
 * @function clusterHexTemplate
 * @deprecated
 */
export function clusterHexTemplate() {
  codi.describe(
    {
      name: 'Cluster Hex Template',
      id: 'api_template_cluster_hex',
      parentId: 'api_workspace_template',
    },
    () => {
      /**
       * @description Cluster Test
       * @function it
       */
      codi.it(
        { name: 'Cluster Hex Test', parentId: 'api_template_cluster_hex' },
        async () => {
          const params = {
            qID: 'id',
            geom: 'geom_3857',
            template: 'cluster_hex',
            layer: 'wkt_layer',
            table: 'test.scratch',
            z: 12,
            resolution: 10,
          };

          const results = await mapp.utils.xhr(
            `/test/api/query?${mapp.utils.paramString(params)}`,
          );
          codi.assertTrue(
            Array.isArray(results),
            'We should get an array returned',
          );
        },
      );
    },
  );
}
