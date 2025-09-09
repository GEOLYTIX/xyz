import checkWorkspaceCache from '../../../mod/workspace/cache.js';
import getLocale from '../../../mod/workspace/getLocale.js';

await codi.describe(
  { name: 'locale checksum:', id: 'locale_checksum' },
  async () => {
    await codi.describe(
      {
        name: 'Checksum calculation for locales',
        id: 'locale_checksum_calc',
        parentId: 'locale_checksum',
      },
      async () => {
        await codi.it(
          {
            name: 'should calculate and store checksum on each locale in workspace',
            parentId: 'locale_checksum_calc',
          },
          async () => {
            // Set up a test workspace
            globalThis.xyzEnv = {
              TITLE: 'LOCALE CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            // Force reload to get a fresh workspace
            const workspace = await checkWorkspaceCache(true);

            // Check that each locale has a checksum
            Object.keys(workspace.locales).forEach((localeKey) => {
              const locale = workspace.locales[localeKey];

              codi.assertTrue(
                typeof locale.checksum !== null,
                `Locale '${localeKey}' should have a checksum property`,
              );

              codi.assertEqual(
                typeof locale.checksum,
                'string',
                `Checksum for locale '${localeKey}' should be a string`,
              );

              codi.assertEqual(
                locale.checksum.length,
                64,
                `SHA-256 checksum for locale '${localeKey}' should be 64 characters long`,
              );

              // Verify checksum is hex format
              codi.assertTrue(
                /^[a-f0-9]{64}$/i.test(locale.checksum),
                `Checksum for locale '${localeKey}' should be valid hexadecimal`,
              );
            });
          },
        );

        await codi.it(
          {
            name: 'should maintain checksum when retrieving locale through getLocale',
            parentId: 'locale_checksum_calc',
          },
          async () => {
            globalThis.xyzEnv = {
              TITLE: 'LOCALE CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            // Force reload to get a fresh workspace
            await checkWorkspaceCache(true);

            // Get locale through getLocale
            const locale = await getLocale({
              locale: 'europe',
              user: { admin: true },
              ignoreRoles: true,
            });

            codi.assertTrue(
              typeof locale.checksum !== null,
              'Retrieved locale should have a checksum property',
            );

            codi.assertEqual(
              locale.checksum.length,
              64,
              'Retrieved locale checksum should be 64 characters long',
            );
          },
        );

        await codi.it(
          {
            name: 'should produce different checksums for different locales',
            parentId: 'locale_checksum_calc',
          },
          async () => {
            globalThis.xyzEnv = {
              TITLE: 'LOCALE CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            await checkWorkspaceCache(true);

            // Get two different locales
            const locale1 = await getLocale({ locale: 'europe' });
            const locale2 = await getLocale({ locale: 'us' });

            // If they're different locales, they should have different checksums
            if (
              locale1 &&
              locale2 &&
              !(locale1 instanceof Error) &&
              !(locale2 instanceof Error)
            ) {
              codi.assertNotEqual(
                locale1.checksum,
                locale2.checksum,
                'Different locales should have different checksums',
              );
            }
          },
        );

        await codi.it(
          {
            name: 'should calculate checksum for nested locales',
            parentId: 'locale_checksum_calc',
          },
          async () => {
            globalThis.xyzEnv = {
              TITLE: 'LOCALE CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            await checkWorkspaceCache(true);

            // Get a nested locale
            const nestedLocale = await getLocale({
              locale: ['europe', 'brand_a_locale'],
              user: { roles: ['europe', 'brand_a'] },
            });

            if (!(nestedLocale instanceof Error)) {
              codi.assertTrue(
                typeof nestedLocale.checksum !== null,
                'Nested locale should have a checksum property',
              );

              codi.assertEqual(
                nestedLocale.checksum.length,
                64,
                'Nested locale checksum should be 64 characters long',
              );

              // Get the same nested locale again
              const nestedLocale2 = await getLocale({
                locale: ['europe', 'brand_a_locale'],
                user: { roles: ['europe', 'brand_a'] },
              });

              if (!(nestedLocale2 instanceof Error)) {
                codi.assertEqual(
                  nestedLocale.checksum,
                  nestedLocale2.checksum,
                  'Same nested locale configuration should produce same checksum',
                );
              }
            }
          },
        );

        await codi.it(
          {
            name: 'should produce consistent checksums across cache reloads',
            parentId: 'locale_checksum_calc',
          },
          async () => {
            globalThis.xyzEnv = {
              TITLE: 'LOCALE CHECKSUM TEST',
              WORKSPACE: 'file:./tests/assets/workspace_nested_locales.json',
              WORKSPACE_AGE: 60000,
            };

            // First load
            await checkWorkspaceCache(true);
            const locale1 = await getLocale({ locale: 'europe' });
            const checksum1 = locale1.checksum;

            // Force reload workspace
            await checkWorkspaceCache(true);
            const locale2 = await getLocale({ locale: 'europe' });

            codi.assertEqual(
              checksum1,
              locale2.checksum,
              'Same locale should have same checksum even after cache reload',
            );
          },
        );
      },
    );
  },
);
