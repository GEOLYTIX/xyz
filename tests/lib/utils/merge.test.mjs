/**
 * @module utils/merge
 */

/**
 * This function is used to test the merge function
 * @function mergeTest
 */
export function merge() {
  codi.describe(
    { name: 'merge Test:', id: 'utils_merge', parentId: 'utils' },
    () => {
      codi.it(
        {
          name: 'Hobbies should be overwritten in the merge',
          parentId: 'utils_merge',
        },
        () => {
          const target = {
            name: 'Rob',
            age: 28,
            address: {
              street: '6 fourteenth street',
              city: 'Johannesburg',
            },
            hobbies: ['squash', 'guitar'],
          };

          const source = {
            name: 'Rob',
            age: 26,
            address: {
              street: '6 fourteenth street',
              city: 'Johannesburg',
            },
            hobbies: ['cooking'],
          };

          const expected = {
            name: 'Rob',
            age: 26,
            address: {
              street: '6 fourteenth street',
              city: 'Johannesburg',
            },
            hobbies: ['cooking'],
          };

          const mergedObj = mapp.utils.merge(target, source);

          codi.assertEqual(mergedObj, expected);
        },
      );

      codi.it(
        {
          name: 'should handle merging with null or undefined values',
          parentId: 'utils_merge',
        },
        async () => {
          const target = {
            name: 'John',
            age: 30,
          };

          const source1 = null;
          const source2 = undefined;

          const expected = {
            name: 'John',
            age: 30,
          };

          const mergedObj1 = mapp.utils.merge(target, source1);
          const mergedObj2 = mapp.utils.merge(target, source2);

          codi.assertEqual(mergedObj1, expected);
          codi.assertEqual(mergedObj2, expected);
        },
      );

      codi.it(
        { name: 'should prevent _proto merging', parentId: 'utils_merge' },
        async () => {
          const target = {
            current: {
              country: {
                in: ['ROI'],
              },
            },
          };

          const source = {
            current: {
              country: {
                in: ['UK'],
              },
            },
            __proto__: {
              polluted: 'polluted',
            },
          };

          const expected = {
            current: {
              country: {
                in: ['ROI'],
              },
            },
          };

          const mergedObj1 = mapp.utils.merge(target, source);
          codi.assertEqual(
            mergedObj1,
            expected,
            'The merge should not happen if a __proto__ is found on an object',
          );
        },
      );
    },
  );
}
