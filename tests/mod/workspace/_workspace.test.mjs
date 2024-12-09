/**
 * ## workspaceTest()
 * @module mod/workspace
 */

import { getLayerTest } from './getLayer.test.mjs';
import { getLocaleTest } from './getLocale.test.mjs';
import { getTemplateTest } from './getTemplate.test.mjs';

async function workspaceTest(mapview) {
    codi.describe({
        name: 'Workspace: Testing Workspace API',
        id: 'api_workspace'
    }, async () => {
        // Test endpoint section
        testEndpoint();

        // Roles section
        testRoles();
    });
}

// Separate function for endpoint testing
async function testEndpoint() {
    codi.it({
        name: 'test endpoint',
        parentId: 'api_workspace'
    }, async () => {
        // First run
        const firstRun = await mapp.utils.xhr(`/test/api/workspace/test`);
        const counts = getTestCounts(firstRun);

        validateFirstRun(firstRun);

        // Second run
        const secondRun = await mapp.utils.xhr(`/test/api/workspace/test`);
        validateSecondRun(secondRun, counts);
    });
}

// Separate function for roles testing
async function testRoles() {
    codi.describe({
        name: 'Roles',
        parentId: 'api_workspace',
        id: 'api_workspace_roles'
    }, async () => {
        const roles = await mapp.utils.xhr(`/test/api/workspace/roles`);
        const expected_roles = [
            'A', 'B', 'merge_into', 'C', 'test',
            'super_test', 'roles_test'
        ];

        await testBaseRoles(roles, expected_roles);
        await testRolesArray(roles);
        await testRolesObject();
        await testLayerWithRoles();
    });
}

// Helper functions
function getTestCounts(workspace_test) {
    return {
        errors: workspace_test.errors.length,
        overwritten_templates: workspace_test.overwritten_templates.length,
        unused_templates: workspace_test.unused_templates.length,
        usage: Object.keys(workspace_test.usage).length
    };
}

function validateFirstRun(workspace_test) {
    codi.assertTrue(
        workspace_test.errors.length > 0,
        'The errors array needs to have more than 1 entry'
    );
    codi.assertTrue(
        workspace_test.unused_templates.length > 0,
        'The unsused templates array needs to have more than 1 entry'
    );
    codi.assertTrue(
        Object.keys(workspace_test.usage).length > 0,
        'The usage object needs to have keys'
    );
}

function validateSecondRun(workspace_test, counts) {
    codi.assertEqual(
        workspace_test.errors.length,
        counts.errors,
        'The errors array needs to have the same number of entries we did the first run'
    );
    codi.assertEqual(
        workspace_test.overwritten_templates.length,
        counts.overwritten_templates,
        'The overwritten templates array needs to have the same number of entries we did the first run'
    );
    codi.assertEqual(
        workspace_test.unused_templates.length,
        counts.unused_templates,
        'The unused templates array needs to have the same number of entries we did the first run'
    );
    codi.assertEqual(
        Object.keys(workspace_test.usage).length,
        counts.usage,
        'The usage templates object needs to have the same number of entries we did the first run'
    );
}

async function testBaseRoles(roles, expected_roles) {
    codi.it({
        name: 'Check base roles',
        parentId: 'api_workspace_roles'
    }, () => {
        codi.assertEqual(
            roles,
            expected_roles,
            'Ensure that we get the correct roles from the API'
        );
    });
}

async function testRolesArray(roles) {
    codi.describe({
        name: 'Should return an array of roles as defined in the workspace',
        parentId: 'api_workspace_roles',
        id: 'api_workspace_roles_array'
    }, async () => {
        codi.it({
            name: 'The roles should be an array',
            parentId: 'api_workspace_roles_array'
        }, async () => {
            codi.assertTrue(Array.isArray(roles));
        });

        const roleTests = ['A', 'B', 'C'].map(role =>
            codi.it({
                name: `Roles should contain ${role}`,
                parentId: 'api_workspace_roles_array'
            }, async () => {
                codi.assertTrue(roles.includes(role));
            })
        );

        Promise.all(roleTests);

        codi.it({
            name: 'Roles should contain *',
            parentId: 'api_workspace_roles_array'
        }, async () => {
            codi.assertTrue(!roles.includes('*'));
        });
    });
}

async function testRolesObject() {
    await codi.describe({
        name: 'Should return an object of workspace roles with definitions',
        id: 'api_workspace_roles_object',
        parentId: 'api_workspace_roles'
    }, async () => {
        const roles = await mapp.utils.xhr(`/test/api/workspace/roles?detail=true`);
        codi.assertTrue(typeof roles === 'object');

        const roleTests = [
            { role: 'A', expected: 'Text about A' },
            { role: 'B', expected: 'Text about B' },
            { role: 'C', test: (role) => typeof role === 'object' }
        ];

        await Promise.all(roleTests.map(({ role, expected, test }) =>
            codi.it({
                name: `Roles object should contain ${role} with correct value`,
                parentId: 'api_workspace_roles_object'
            }, async () => {
                if (test) {
                    codi.assertTrue(test(roles[role]));
                } else {
                    codi.assertTrue(roles[role] === expected);
                }
            })
        ));

        codi.it({
            name: 'Roles object should not contain *',
            parentId: 'api_workspace_roles_object'
        }, async () => {
            codi.assertTrue(!roles['*']);
        });
    });
}

async function testLayerWithRoles() {
    codi.it({
        name: 'Should not return a layer with roles defined',
        parentId: 'api_workspace_roles'
    }, async () => {
        const layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=roles_test`);
        codi.assertTrue(
            layer instanceof Error,
            'we should receive an error when trying to access this layer'
        );
    });
}

export const workspaceSuite = {
    workspaceTest,
    getLayerTest,
    getLocaleTest,
    getTemplateTest
}
