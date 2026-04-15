import { describe, expect, it } from 'vitest';
import mergeDeep from '@geolytix/xyz-app/mod/utils/merge.js';

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

    expect(mergedObj).toEqual(expected);
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

    expect(mergedObj).toEqual(expected);
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

    expect(mergedObj1).toEqual(expected);
    expect(mergedObj2).toEqual(expected);
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
    expect(mergedObj1).toEqual(expected);
  });

  it('should merge multiple sources into target', () => {
    const target = { sourceA: 'A' };
    const source1 = { sourceB: 'B' };
    const source2 = { sourceC: 'C' };
    const source3 = { sourceD: 'D' };

    const expected = {
      sourceA: 'A',
      sourceB: 'B',
      sourceC: 'C',
      sourceD: 'D',
    };

    const mergedObj = mergeDeep(target, source1, source2, source3);
    expect(mergedObj).toEqual(expected);
  });

  it('should create empty object if target key does not exist', () => {
    const target = {};
    const source = {
      settings: {
        theme: 'a theme',
        labels: true,
      },
    };

    const expected = {
      settings: {
        theme: 'a theme',
        labels: true,
      },
    };

    const mergedObj = mergeDeep(target, source);
    expect(mergedObj).toEqual(expected);
  });

  it('should handle equal arrays correctly', () => {
    const target = {
      plugins: ['pluginA', 'pluginB'],
    };
    const source = {
      plugins: ['pluginA', 'pluginB'],
    };

    // When arrays are equal, source array should be used
    const expected = {
      plugins: ['pluginA', 'pluginB'],
    };

    const mergedObj = mergeDeep(target, source);
    expect(mergedObj).toEqual(expected);
  });

  it('should return target when no sources provided', () => {
    const target = { name: 'test', value: 46 };

    const result = mergeDeep(target);
    expect(result).toEqual(target);
  });
});
