/**
 * ## workspaceTest()
 * @module mod/workspace
 */

import { getLayerTest } from './getLayer.test.mjs';
import { getLocaleTest } from './getLocale.test.mjs';
import { getTemplateTest } from './getTemplate.test.mjs';

/**
 * This function is used as an entry point for the changeEndTest
 * This function is also in a function as to not execute in the CLI environment and only execute in a browser.
 * @function workspaceTest
 * @param {Object} mapview
 */

export const workspaceSuite = {
  workspaceTest,
  getLayerTest,
  getLocaleTest,
  getTemplateTest,
};

async function workspaceTest(mapview) {
  if (mapp.user) {
    await codi.describe(
      { name: 'Workspace: Testing Workspace API', id: 'api_workspace' },
      async () => {
        await codi.it(
          { name: 'test endpoint', parentId: 'api_workspace' },
          async () => {
            let workspace_test = await mapp.utils.xhr(
              `/test/api/workspace/test`,
            );

            const counts = {
              errors: workspace_test.errors.length,
              overwritten_templates:
                workspace_test.overwritten_templates.length,
              unused_templates: workspace_test.unused_templates.length,
              usage: Object.keys(workspace_test.usage).length,
            };

            codi.assertTrue(
              workspace_test.errors.length > 0,
              'The errors array needs to have more than 1 entry',
            );
            codi.assertTrue(
              workspace_test.unused_templates.length > 0,
              'The unsused templates array needs to have more than 1 entry',
            );
            codi.assertTrue(
              Object.keys(workspace_test.usage).length > 0,
              'The usage object needs to have keys',
            );

            workspace_test = await mapp.utils.xhr(`/test/api/workspace/test`);

            codi.assertEqual(
              workspace_test.errors.length,
              counts.errors,
              'The errors array needs to have the same number of entries we did the first run',
            );
            codi.assertEqual(
              workspace_test.overwritten_templates.length,
              counts.overwritten_templates,
              'The overwritten templates array needs to have the same number of entries we did the first run',
            );
            codi.assertEqual(
              workspace_test.unused_templates.length,
              counts.unused_templates,
              'The unused templates array needs to have the same number of entries we did the first run',
            );
            codi.assertEqual(
              Object.keys(workspace_test.usage).length,
              counts.usage,
              'The usage templates object needs to have the same number of entries we did the first run',
            );
          },
        );

        await codi.describe(
          {
            name: 'Roles',
            parentId: 'api_workspace',
            id: 'api_workspace_roles',
          },
          async () => {
            const roles = await mapp.utils.xhr(`/test/api/workspace/roles`);

            const expected_roles = ['A', 'B', 'merge_into', 'C'];

            codi.it(
              { name: 'Check base roles', parentId: 'api_workspace_roles' },
              () => {
                codi.assertEqual(
                  roles,
                  expected_roles,
                  'Ensure that we get the correct roles from the API',
                );
              },
            );

            await codi.describe(
              {
                name: 'Should return an array of roles as defined in the workspace',
                parentId: 'api_workspace_roles',
                id: 'api_workspace_roles_array',
              },
              async () => {
                // Check the response is an array
                codi.it(
                  {
                    name: 'The roles should be an array',
                    parentId: 'api_workspace_roles_array',
                  },
                  async () => {
                    codi.assertTrue(Array.isArray(roles));
                  },
                );

                // Check the response contains 'A', 'B', 'C'
                codi.it(
                  {
                    name: 'Roles should contain A',
                    parentId: 'api_workspace_roles_array',
                  },
                  async () => {
                    codi.assertTrue(roles.includes('A'));
                  },
                );

                codi.it(
                  {
                    name: 'Roles should contain B',
                    parentId: 'api_workspace_roles_array',
                  },
                  async () => {
                    codi.assertTrue(roles.includes('B'));
                  },
                );

                codi.it(
                  {
                    name: 'Roles should contain C',
                    parentId: 'api_workspace_roles_array',
                  },
                  async () => {
                    codi.assertTrue(roles.includes('C'));
                  },
                );

                // Check the response does not contain the reserved role '*'
                codi.it(
                  {
                    name: 'Roles should contain *',
                    parentId: 'api_workspace_roles_array',
                  },
                  async () => {
                    codi.assertTrue(!roles.includes('*'));
                  },
                );
              },
            );

            await codi.describe(
              {
                name: 'Should return an object of workspace roles with definitions',
                id: 'api_workspace_roles_object',
                parentId: 'api_workspace_roles',
              },
              async () => {
                const roles = await mapp.utils.xhr(
                  `/test/api/workspace/roles?detail=true`,
                );
                // Check the response is an object
                codi.assertTrue(typeof roles === 'object');

                codi.it(
                  {
                    name: 'Roles object should contain A with value = Text about A',
                    parentId: 'api_workspace_roles_object',
                  },
                  async () => {
                    // Check the object contains 'A' role with text' Text about A'
                    codi.assertTrue(roles.A === 'Text about A');
                  },
                );
                codi.it(
                  {
                    name: 'Roles object should contain B with value = Text about A',
                    parentId: 'api_workspace_roles_object',
                  },
                  async () => {
                    // Check the object contains 'B' role with text' Text about B'
                    codi.assertTrue(roles.B === 'Text about B');
                  },
                );
                codi.it(
                  {
                    name: 'Roles object should contain C with value = {}',
                    parentId: 'api_workspace_roles_object',
                  },
                  async () => {
                    // Check the object contains 'C' role as an object
                    // this is as its not added to the roles object in the workspace
                    // So it gets added as an object
                    codi.assertTrue(typeof roles.C === 'object');
                  },
                );
                codi.it(
                  {
                    name: 'Roles object should not contain *',
                    parentId: 'api_workspace_roles_object',
                  },
                  async () => {
                    // Check the reserved role '*' is not included in the object
                    codi.assertTrue(!roles['*']);
                  },
                );
              },
            );

            codi.it(
              {
                name: 'Should not return a layer with roles defined',
                parentId: 'api_workspace_roles',
              },
              async () => {
                const layer = await mapp.utils.xhr(
                  `/test/api/workspace/layer?layer=roles_test`,
                );
                codi.assertTrue(
                  layer instanceof Error,
                  'we should receive an error when trying to access this layer',
                );
              },
            );
          },
        );
      },
    );
  }
}
