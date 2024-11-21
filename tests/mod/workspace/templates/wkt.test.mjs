/**
 * @module mod/workspace/templates/wkt.test.mjs
 */

/**
 * @description Entry point for the wkt template module
 * @function wktTemplate
 */
export async function wktTemplate() {
    await codi.describe('Workspace Templates: wkt Template', async () => {
        /**
         * @description Cluster Test
         * @function it
         */
        await codi.it('wkt Test', async () => {

            const params = {
                template: 'wkt',
                locale: 'locale',
                layer: 'template_test',
                table: 'test.scratch',
                geom: 'geom_3857',
                srid: '3857',
                fields: 'test_template_style',
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);
            codi.assertTrue(Array.isArray(results), 'We should get an array returned');
        });
    });
}