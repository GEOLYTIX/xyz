/**
 * ## workspaceTest()
 * @module mod/workspace
 */

/**
 * This function is used as an entry point for the changeEndTest
 * This function is also in a function as to not execute in the CLI environment and only execute in a browser.
 * @function workspaceTest 
 * @param {Object} mapview 
*/
export async function workspaceTest() {

    await codi.describe('Workspace: Testing Workspace API', async () => {

        await codi.it('Workspace: Getting Locales', async () => {
            const locales = await mapp.utils.xhr(`/test/api/workspace/locales`);
            codi.assertEqual(locales[0].key, 'locale', 'Ensure that we are getting a locale back from the API')
        });

        await codi.it('Workspace: Getting a Locale', async () => {
            const locale = await mapp.utils.xhr(`/test/api/workspace/locale?locale=locale`);
            codi.assertTrue(!!locale.key, 'The locale should have a key property');
            codi.assertTrue(!!locale.layers, 'The locale should have layers');
            codi.assertTrue(!!locale.name, 'The locale should have a name');
            codi.assertTrue(!!locale.plugins, 'The locale should have plugins');
            codi.assertTrue(!!locale.syncPlugins, 'The locale should have syncPlugins');
        });

        await codi.it('Workspace: Getting template_test Layer', async () => {
            let layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test`);
            codi.assertEqual(layer.key, 'template_test', 'Ensure that we get the template_test layer from the API')
            codi.assertEqual(layer.infoj.length, 4, 'The infoj should always have 4 infoj entries')
            codi.assertTrue(!!layer.style, 'The layer needs to have a style object from another template')

            layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test`);
            codi.assertEqual(layer.infoj.length, 4, 'The infoj should always have 4 infoj entries')
            codi.assertTrue(!!layer.style, 'The layer needs to have a style object from another template')
        });

        await codi.it('Workspace: Getting template_test_vanilla Layer', async () => {
            let layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test_vanilla`);
            codi.assertEqual(layer.key, 'template_test_vanilla', 'Ensure that we get the template_test_vanilla layer from the API')
            codi.assertEqual(layer.infoj.length, 4, 'The infoj should always have 4 infoj entries')
            codi.assertTrue(!!layer.style, 'The layer needs to have a style object from another template')

            layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test`);
            codi.assertEqual(layer.infoj.length, 4, 'The infoj should always have 4 infoj entries')
        });

        await codi.it('Workspace: Getting Roles', async () => {
            const roles = await mapp.utils.xhr(`/test/api/workspace/roles`);
            const expected_roles = ['A', 'B', 'C', 'test', 'super_test']
            codi.assertEqual(roles, expected_roles, 'Ensure that we get the correct roles from the API')
        });

        await codi.it('Should return an array of roles as defined in the workspace', async () => {
            const response = await fetch('api/workspace/roles');
            const roles = await response.json();
            // Check the response is an array
            codi.assertTrue(Array.isArray(roles));

            // Check the response contains 'A', 'B', 'C'
            await codi.it('Roles should contain A', async () => {
                codi.assertTrue(roles.includes('A'));
            });

            await codi.it('Roles should contain B', async () => {

                codi.assertTrue(roles.includes('B'));
            });

            await codi.it('Roles should contain C', async () => {
                codi.assertTrue(roles.includes('C'));

            });

            // Check the response does not contain the reserved role '*'
            await codi.it('Roles should not contain *', async () => {
                codi.assertTrue(!roles.includes('*'));
            });
        });

        await codi.it('Should return an object of workspace roles with definitions', async () => {
            const response = await fetch('api/workspace/roles?detail=true');
            const roles = await response.json();
            // Check the response is an object
            codi.assertTrue(typeof roles === 'object');

            await codi.it('Roles object should contain A with value = Text about A', async () => {
                // Check the object contains 'A' role with text' Text about A'
                codi.assertTrue(roles.A === 'Text about A');
            });

            await codi.it('Roles object should contain B with value = Text about A', async () => {
                // Check the object contains 'B' role with text' Text about B'
                codi.assertTrue(roles.B === 'Text about B');
            });

            await codi.it('Roles object should contain C with value = {}', async () => {
                // Check the object contains 'C' role as an object
                // this is as its not added to the roles object in the workspace
                // So it gets added as an object 
                codi.assertTrue(typeof roles.C === 'object');
            });

            await codi.it('Roles object should not contain *', async () => {
                // Check the reserved role '*' is not included in the object
                codi.assertTrue(!roles['*']);
            });
        });
    });
}