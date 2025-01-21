/**
 * @module utils/versionCheck
 */

/**
 * This function is used to test the versionCheck function
 * @function versionCheck
 */
export function versionCheck() {
  codi.describe(
    { name: 'versionCheck Test:', id: 'utils_versionCheck', parentId: 'utils' },
    async () => {
      codi.it(
        {
          name: 'should return false if the major and minor are the same but version patch exceeds',
          parentId: 'utils_versionCheck',
        },
        () => {
          mapp.version = '4.11.1';

          const result = mapp.utils.versionCheck('4.11');

          codi.assertEqual(result, true);
        },
      );

      codi.it(
        {
          name: 'should return true if the major version is more than',
          parentId: 'utils_versionCheck',
        },
        () => {
          mapp.version = '4.9.1';

          const result = mapp.utils.versionCheck('3.9');

          codi.assertEqual(result, true);
        },
      );

      codi.it(
        {
          name: 'should return false if the major version is the same and the minor version is less',
          parentId: 'utils_versionCheck',
        },
        () => {
          mapp.version = '4.9.0';

          const result = mapp.utils.versionCheck('4.10.0');

          codi.assertEqual(result, false);
        },
      );

      codi.it(
        {
          name: 'should return true if the major version is the same and the minor version is more',
          parentId: 'utils_versionCheck',
        },
        () => {
          mapp.version = '4.11.0';

          const result = mapp.utils.versionCheck('4.10.0');

          codi.assertEqual(result, true);
        },
      );

      codi.it(
        {
          name: 'should return true if the major version is the same and the minor version is the same',
          parentId: 'utils_versionCheck',
        },
        () => {
          mapp.version = '4.11.2';

          const result = mapp.utils.versionCheck('4.11.1');

          codi.assertEqual(result, true);
        },
      );
    },
  );
}
