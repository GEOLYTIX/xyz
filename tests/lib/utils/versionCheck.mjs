/**
 * @module utils/versionCheck
 */

/**
 * This function is used to test the versionCheck function
 * @function versionCheck
 */
export async function versionCheck() {

    await codi.describe('Utils: versionCheck Test', async () => {

        await codi.it('should return true if the major version is more than', async () => {
            const value = '3.9.0';

            // Set mapp.version for the test
            mapp.version = '4.9.1';

            const result = mapp.utils.versionCheck(value);

            codi.assertEqual(result, true);
        });

        await codi.it('should return false if the major version is the same and the minor version is less', async () => {
            const value = '4.10.0';

            // Set mapp.version for the test
            mapp.version = '4.9.0';

            const result = mapp.utils.versionCheck(value);

            codi.assertEqual(result, false);
        });

        await codi.it('should return true if the major version is the same and the minor version is more', async () => {
            const value = '4.10.0';

            // Set mapp.version for the test
            mapp.version = '4.11.0';

            const result = await mapp.utils.versionCheck(value);

            codi.assertEqual(result, true);
        });

        await codi.it('should return true if the major version is the same and the minor version is the same', async () => {
            const value = '4.11.1';

            // Set mapp.version for the test
            mapp.version = '4.11.2';

            const result = await mapp.utils.versionCheck(value);

            codi.assertEqual(result, true);
        });
    });
}
