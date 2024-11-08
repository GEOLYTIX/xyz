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
export async function workspaceTest(mapview) {

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
            codi.assertTrue(!!layer.table, 'Ensure that the layer has a table');
            codi.assertTrue(!!layer.geom, 'Ensure that the layer has a geom');
            codi.assertTrue(!!layer.group, 'Ensure that the layer has a group');
            codi.assertEqual(layer.infoj.length, 7, 'The infoj should always have 7 infoj entries')
            codi.assertTrue(!!layer.style, 'The layer needs to have a style object from another template')

            layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test`);
            codi.assertEqual(layer.infoj.length, 7, 'The infoj should always have 7 infoj entries')
            codi.assertTrue(!!layer.style, 'The layer needs to have a style object from another template')
            codi.assertTrue(!!layer.err, 'The layer should have a error array')
            codi.assertEqual(layer.err.length, 1, 'There should be on failure on the layer');
        });

        await codi.it('Workspace: Getting template_test_vanilla Layer', async () => {
            const layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=template_test_vanilla`);
            codi.assertEqual(layer.key, 'template_test_vanilla', 'Ensure that we get the template_test_vanilla layer from the API')
            codi.assertEqual(layer.infoj.length, 6, 'The infoj should always have 6 infoj entries')
            codi.assertTrue(!!layer.style, 'The layer needs to have a style object from another template')
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

        await codi.it('Should return a layer with roles defined', async () => {
            const layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=roles_test`);
            codi.assertTrue(layer.roles === 'object', 'The layer should have a roles object assigned to it.');
        });

        await codi.it('Workspace: Testing the test endpoint', async () => {
            let workspace_test = await mapp.utils.xhr(`/test/api/workspace/test`);

            const counts = {
                errors: workspace_test.errors.length,
                overwritten_templates: workspace_test.overwritten_templates.length,
                unused_templates: workspace_test.unused_templates.length,
                usage: Object.keys(workspace_test.usage).length
            }

            codi.assertTrue(workspace_test.errors.length > 0, 'The errors array needs to have more than 1 entry')
            codi.assertTrue(workspace_test.overwritten_templates.length > 0, 'The overwritten templates array needs to have more than 1 entry')
            codi.assertTrue(workspace_test.unused_templates.length > 0, 'The unsused templates array needs to have more than 1 entry')
            codi.assertTrue(Object.keys(workspace_test.usage).length > 0, 'The usage object needs to have keys')

            workspace_test = await mapp.utils.xhr(`/test/api/workspace/test`);

            codi.assertEqual(workspace_test.errors.length, counts.errors, 'The errors array needs to have the same number of entries we did the first run')
            codi.assertEqual(workspace_test.overwritten_templates.length, counts.overwritten_templates, 'The overwritten templates array needs to have the same number of entries we did the first run')
            codi.assertEqual(workspace_test.unused_templates.length, counts.unused_templates, 'The unused templates array needs to have the same number of entries we did the first run')
            codi.assertEqual(Object.keys(workspace_test.usage).length, counts.usage, 'The usage templates object needs to have the same number of entries we did the first run')
        });
    });
}