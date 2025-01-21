import { describe, it, assertEqual } from 'codi-test-framework';
import mergeDeep from '../../../mod/utils/merge.js';

describe('mergeDeep Module', () => {
  it('should merge objects deeply', () => {
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

    assertEqual(mergedObj, expected);
  });

  it('should merge arrays deeply', () => {
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

    assertEqual(mergedObj, expected);
  });

  it('should handle merging with null or undefined values', () => {
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

    assertEqual(mergedObj1, expected);
    assertEqual(mergedObj2, expected);
  });

  it('should handle merging with unequal arrays', () => {
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
    assertEqual(mergedObj1, expected);
  });
});
