/**
 * @module mod/workspace/templates/cluster.test.mjs
 */

/**
 * @description Entry point for the cluster template module
 * @function clusterTemplate
 */
export function clusterTemplate() {
    codi.describe({ name: 'Workspace Templates: Cluster Template', id: 'api_template_cluster' }, () => {
        /**
         * @description Cluster Test
         * @function it
         */
        codi.it({ name: 'Cluster Test', parentId: 'api_template_cluster' }, async () => {

            const params = {
                qID: 'id',
                geom: 'geom_3857',
                template: 'cluster',
                layer: 'changeEnd',
                table: 'test.scratch',
                z: 12,
                resolution: 10
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);
            codi.assertTrue(Array.isArray(results), 'We should get an array returned');
        });
    });
}