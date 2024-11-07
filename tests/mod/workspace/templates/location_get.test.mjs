
/**
 * @module mod/workspace/templates/location_get.test.mjs
 */

/**
 * @description Entry point for the cluster template module
 * @function geomjsonTemplate
 */
export async function locationGetTemplate() {
    await codi.describe('Workspace Templates: location_get Template', async () => {
        /**
         * @description location_get Template Test
         * @function it
         */
        await codi.it('location_get Template Test', async () => {

            const params = {
                id: 22,
                template: 'location_get',
                layer: 'changeEnd',
                table: 'test.scratch'
            }

            const results = await mapp.utils.xhr(`/test/api/query?${mapp.utils.paramString(params)}`);

            codi.assertTrue(Object.hasOwn(results, 'char_field'), 'We expect the scratch layer to have a char_field');
            codi.assertTrue(Object.hasOwn(results, 'id'), 'We expect the scratch layer to have a id');
            codi.assertTrue(Object.hasOwn(results, 'pin'), 'We expect the scratch layer to have a pin');
            codi.assertTrue(Object.hasOwn(results, 'textarea'), 'We expect the scratch layer to have a textarea');
            codi.assertTrue(Array.isArray(results.pin), 'We expect the pin to be an array');

        });
    });
}