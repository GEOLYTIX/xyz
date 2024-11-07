
/**
 * @module mod/workspace/templates/cluster_hex.test.mjs
 */

/**
 * @description Entry point for the cluster template module
 * @function clusterHexTemplate
 */
export async function clusterHexTemplate() {
    await codi.describe('Workspace Templates: Cluster Hex Template', async () => {
        /**
         * @description Cluster Test
         * @function it
         */
        await codi.it('Cluster Hex Test', async () => {

            const params = {
                qID: 'id',
                geom: 'geom_3857',
                template: 'cluster_hex',
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