/**
 * @module utils/versionCheck
 */

/**
 * This function is used to test the versionCheck function
 * @function versionCheck
 */
export async function versionCheck() {
  await codi.describe('Utils: versionCheck Test', async () => {
    await codi.it(
      'should return false if the major and minor are the same but version patch exceeds',
      async () => {
        mapp.version = '4.11.1';

        const result = await mapp.utils.versionCheck('4.11');

        codi.assertEqual(result, true);
      },
    );

    await codi.it(
      'should return true if the major version is more than',
      async () => {
        mapp.version = '4.9.1';

        const result = mapp.utils.versionCheck('3.9');

        codi.assertEqual(result, true);
      },
    );

    await codi.it(
      'should return false if the major version is the same and the minor version is less',
      async () => {
        mapp.version = '4.9.0';

        const result = mapp.utils.versionCheck('4.10.0');

        codi.assertEqual(result, false);
      },
    );

    await codi.it(
      'should return true if the major version is the same and the minor version is more',
      async () => {
        mapp.version = '4.11.0';

        const result = await mapp.utils.versionCheck('4.10.0');

        codi.assertEqual(result, true);
      },
    );

    await codi.it(
      'should return true if the major version is the same and the minor version is the same',
      async () => {
        mapp.version = '4.11.2';

        const result = await mapp.utils.versionCheck('4.11.1');

        codi.assertEqual(result, true);
      },
    );
  });
}
