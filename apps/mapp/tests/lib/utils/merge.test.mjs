/**
## /tests/lib/utils/merge

@module /tests/lib/utils/merge
*/

import { describe, expect, it } from 'vitest';

describe('utils/merge', () => {
  it('overwrites arrays rather than concatenating them', () => {
    const target = {
      address: {
        city: 'Johannesburg',
        street: '6 fourteenth street',
      },
      age: 28,
      hobbies: ['squash', 'guitar'],
      name: 'Rob',
    };

    const source = {
      address: {
        city: 'Johannesburg',
        street: '6 fourteenth street',
      },
      age: 26,
      hobbies: ['cooking'],
      name: 'Rob',
    };

    expect(mapp.utils.merge(target, source)).toEqual({
      address: {
        city: 'Johannesburg',
        street: '6 fourteenth street',
      },
      age: 26,
      hobbies: ['cooking'],
      name: 'Rob',
    });
  });

  it('leaves the target unchanged for a null or undefined source', () => {
    const target = {
      age: 30,
      name: 'John',
    };

    expect(mapp.utils.merge(target, null)).toEqual({
      age: 30,
      name: 'John',
    });

    expect(mapp.utils.merge(target, undefined)).toEqual({
      age: 30,
      name: 'John',
    });
  });

  it('refuses to merge a source carrying __proto__', () => {
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

    // The whole merge is abandoned, so the target keeps its original value
    // rather than taking the UK entry from the source.
    expect(mapp.utils.merge(target, source)).toEqual({
      current: {
        country: {
          in: ['ROI'],
        },
      },
    });

    expect({}.polluted).toBeUndefined();
  });
});
