/**
 * @module mod/workspace/templates/cluster.test.mjs
 */

/**
 * @description Entry point for the cluster template module
 * @function clusterTemplate
 */
export async function clusterTemplate() {
    await codi.describe('Workspace Templates: Cluster Template', async () => {
        /**
         * @description Cluster Test
         * @function it
         */
        await codi.it('Cluster Test', async () => {

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