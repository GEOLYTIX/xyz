/**
## /tests/lib/utils/compose

@module /tests/lib/utils/compose
*/

import { describe, expect, it } from 'vitest';

describe('utils/compose', () => {
  it('composes functions from left to right', () => {
    const addOne = (x) => x + 1;
    const double = (x) => x * 2;
    const square = (x) => x * x;

    const composed = mapp.utils.compose(addOne, double, square);

    // ((3 + 1) * 2) ^ 2
    expect(composed(3)).toEqual(64);
  });

  it('composes a single function', () => {
    const composed = mapp.utils.compose((x) => x + 2);

    expect(composed(5)).toEqual(7);
  });

  it('returns the input when no functions are provided', () => {
    const composed = mapp.utils.compose();

    expect(composed(10)).toEqual(10);
  });

  it('composes over types other than numbers', () => {
    const toUpperCase = (str) => str.toUpperCase();
    const addExclamation = (str) => `${str}!`;

    const composed = mapp.utils.compose(addExclamation, toUpperCase);

    expect(composed('hello')).toEqual('HELLO!');
  });
});
