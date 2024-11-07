/**
 * @module mod/workspace/templates/mvt.test.mjs
 */

/**
 * @description Entry point for the mvt template module
 * @function mvtTemplate
 */
export async function mvtTemplate() {
    await codi.describe('Workspace Templates: mvt Template', async () => {
        /**
         * @description mvt Template Test
         * @function it
         */
        await codi.it('mvt Template Test', async () => {

            const params = {
                template: 'mvt',
                z: '8',
                x: '127',
                y: '86',
                locale: 'locale',
                layer: 'mvt_test',
                table: 'test.mvt_test',
                geom: 'geom_3857',
                fields: 'numeric_field',
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);

            codi.assertFalse(results instanceof Error, 'We shouldnt get an error')

        });
    });
}