import mergeDeep from '../../../mod/utils/merge.js';

codi.describe({ name: 'mergeDeep Module', id: 'merge_deep_test' }, () => {
  codi.it(
    { name: 'should merge objects deeply', parentId: 'merge_deep_test' },
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
        age: 28,
        address: {
          street: '6 fourteenth street',
          city: 'Johannesburg',
        },
        hobbies: ['cooking'],
      };

      const expected = {
        name: 'Rob',
        age: 28,
        address: {
          street: '6 fourteenth street',
          city: 'Johannesburg',
        },
        hobbies: ['squash', 'guitar', 'cooking'],
      };

      const mergedObj = mergeDeep(target, source);

      codi.assertEqual(mergedObj, expected);
    },
  );

  codi.it(
    { name: 'should merge arrays deeply', parentId: 'merge_deep_test' },
    () => {
      const target = {
        fruits: ['apple', 'banana'],
      };

      const source = {
        fruits: ['banana', 'orange'],
      };

      const expected = {
        fruits: ['apple', 'banana', 'banana', 'orange'],
      };

      const mergedObj = mergeDeep(target, source);

      codi.assertEqual(mergedObj, expected);
    },
  );

  codi.it(
    {
      name: 'should handle merging with null or undefined values',
      parentId: 'merge_deep_test',
    },
    () => {
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

      const mergedObj1 = mergeDeep(target, source1);
      const mergedObj2 = mergeDeep(target, source2);

      codi.assertEqual(mergedObj1, expected);
      codi.assertEqual(mergedObj2, expected);
    },
  );

  codi.it(
    {
      name: 'should handle merging with unequal arrays',
      parentId: 'merge_deep_test',
    },
    () => {
      const filter = {
        current: {
          country: {
            in: ['ROI'],
          },
        },
      };
      const filter2 = {
        current: {
          country: {
            in: ['UK'],
          },
        },
      };

      const expected = {
        current: {
          country: {
            in: ['ROI', 'UK'],
          },
        },
      };

      const mergedObj1 = mergeDeep(filter, filter2);
      codi.assertEqual(mergedObj1, expected);
    },
  );
});
