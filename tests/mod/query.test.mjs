
/**
 * ## queryTest()
 * @module mod/query
 */

/**
 * This function is used to test the query API endpoint
 * @function querytest 
 * @param {Object} mapview 
*/
export async function queryTest() {


    await codi.describe('Query: Testing Query API', async () => {
        /**
         * @description Query: Testing Query defined on infoj entry
         * @function it 
         */
        await codi.it('Query: Testing Query defined on infoj entry', async () => {
            const expected_result = [1, 2, 5, 3, 4];
            const results = await mapp.utils.xhr(`/test/api/query?template=data_array`);
            codi.assertEqual(results, expected_result, 'We should be able to just call the template even if its not part of the workspace.templates object in configuration');
        });
        /**
         * @description Query: Testing Module defined in templates
         * @function it 
         */
        await codi.it('Query: Testing Module defined in templates', async () => {
            const expected_result = {
                'bar': 'foo'
            }
            const results = await mapp.utils.xhr(`/test/api/query?template=module_test`);
            codi.assertEqual(results, expected_result, 'The Module should return the basic query');
        });

        /**
         * @description Query: Testing a query with a bogus dbs string via the req params
         * @function it 
         */
        await codi.it('Query: Testing a query with a bogus dbs string via the req params', async () => {
            const expected_result = {
                'bar': 'foo'
            }
            const results = await mapp.utils.xhr(`/test/api/query?template=module_test&dbs=bogus`);
            codi.assertEqual(results, expected_result, 'The Module should return the basic query');
        });

        /**
         * @description Query: Testing a query with a bogus dbs on the template
         * @function it 
         */
        await codi.it('Query: Testing a query with a bogus dbs on the template', async () => {
            const results = await mapp.utils.xhr(`/test/api/query?template=bogus_data_array`);
            codi.assertTrue(results instanceof Error, 'We should return an error for a bogus DBS connection');
        });
    });
}