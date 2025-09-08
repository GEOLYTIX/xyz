import checkWorkspaceCache from '../../../mod/workspace/cache.js';

await codi.describe(
  { name: 'workspace cache:', id: 'workspace_cache' },
  async () => {
    await codi.describe(
      {
        name: 'Checksum calculation',
        id: 'workspace_cache_checksum',
        parentId: 'workspace_cache',
      },
      async () => {
        await codi.it(
          {
            name: 'should calculate and store checksum on workspace',
            parentId: 'workspace_cache_checksum',
          },
          async () => {
            // Set up a test workspace
            globalThis.xyzEnv = {
              TITLE: 'CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            // Force reload to get a fresh workspace
            const workspace = await checkWorkspaceCache(true);

            codi.assertTrue(
              typeof workspace.checksum !== null,
              'Workspace should have a checksum property',
            );

            codi.assertEqual(
              typeof workspace.checksum,
              'string',
              'Checksum should be a string',
            );

            codi.assertEqual(
              workspace.checksum.length,
              64,
              'SHA-256 checksum should be 64 characters long',
            );

            // Verify checksum is hex format
            codi.assertTrue(
              /^[a-f0-9]{64}$/i.test(workspace.checksum),
              'Checksum should be valid hexadecimal',
            );
          },
        );

        await codi.it(
          {
            name: 'should produce same checksum for identical workspace',
            parentId: 'workspace_cache_checksum',
          },
          async () => {
            globalThis.xyzEnv = {
              TITLE: 'CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            // Load workspace twice
            const workspace1 = await checkWorkspaceCache(true);
            const workspace2 = await checkWorkspaceCache(true);

            codi.assertEqual(
              workspace1.checksum,
              workspace2.checksum,
              'Workspace cached a second time should produce a different checksum',
            );
          },
        );

        await codi.it(
          {
            name: 'should produce different checksum for different workspaces',
            parentId: 'workspace_cache_checksum',
          },
          async () => {
            // First workspace with one title
            globalThis.xyzEnv = {
              TITLE: 'CHECKSUM TEST 1',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };
            const workspace1 = await checkWorkspaceCache(true);

            // Second workspace with different title
            globalThis.xyzEnv = {
              TITLE: 'CHECKSUM TEST 2',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };
            const workspace2 = await checkWorkspaceCache(true);

            codi.assertNotEqual(
              workspace1.checksum,
              workspace2.checksum,
              'Different workspace configurations should produce different checksums',
            );
          },
        );

        await codi.it(
          {
            name: 'should maintain checksum when retrieved from cache',
            parentId: 'workspace_cache_checksum',
          },
          async () => {
            globalThis.xyzEnv = {
              TITLE: 'CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            // Force reload to get a fresh workspace
            const workspace1 = await checkWorkspaceCache(true);

            // Get workspace from cache (not forcing reload)
            const workspace2 = await checkWorkspaceCache();

            console.log(workspace1.checksum);
            console.log(workspace2.checksum);

            codi.assertEqual(
              workspace2.checksum,
              workspace1.checksum,
              'Cached workspace should maintain the same checksum',
            );
          },
        );
      },
    );
  },
);
