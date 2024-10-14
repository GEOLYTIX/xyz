/**
 * @module utils/versionCheck
 */

/**
 * This function is used to test the versionCheck function
 * @function versionCheck
 */
export async function versionCheck() {

    await codi.describe('Utils: versionCheck Test', async () => {

        await codi.it('should return true if the current version is more than or equal to the given value (passing a number)', async () => {
            const value = 480;

            // Set mapp.version for the test
            mapp.version = '4.9.1';

            const result = mapp.utils.versionCheck(value);

            codi.assertEqual(result, true);
        });

        await codi.it('should return false if the current version is less than the given value (passing a string)', async () => {
            const value = '4.12.0';

            // Set mapp.version for the test
            mapp.version = '4.11.0';

            const result = await mapp.utils.versionCheck(value);

            codi.assertEqual(result, false);
        });
    });
}
