
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
        await codi.it('Query: Testing Query defined on infoj entry', async () => {
            const expected_result = [1, 2, 5, 3, 4];
            const results = await mapp.utils.xhr(`/test/api/query?template=data_array`);
            codi.assertEqual(results, expected_result, 'We should be able to just call the template even if its not part of the workspace.templates object in configuration');
        });

        await codi.it('Query: Testing Module defined in templates', async () => {
            const expected_result = {
                'bar': 'foo'
            }
            const results = await mapp.utils.xhr(`/test/api/query?template=module_test`);
            codi.assertEqual(results, expected_result, 'The Module should return the basic query');
        });

        await codi.it('Query: Testing template override', async () => {
            const expected_result = {
                'bar': 'foo'
            }
            const results = await mapp.utils.xhr(`/test/api/query?template=get_last_location`);
            codi.assertEqual(results, expected_result, 'We should we able to ovverride the get_last_location(core) template');
        });

    });
}