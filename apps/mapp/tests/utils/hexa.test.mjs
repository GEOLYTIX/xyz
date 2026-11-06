import { describe, expect, it } from 'vitest';
import hexa from '../../lib/utils/hexa.mjs';

describe('utils/hexa', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.hexa).toBe(hexa);
  });

  it.each([
    ['#ff0000', 1, '#ff0000ff'],
    ['#ff0000', 0.5, '#ff00007f'],
    ['#ff0000', 0, '#ff000000'],
    ['#ff0000', undefined, '#ff0000'],
    ['#ff0000', 'abc', '#ff0000'],
    ['#f00', 1, '#f00f'],
    ['#f00', 0.5, '#f007'],
    ['#ff000080', 0.5, '#ff000080'],
    ['red', 0.5, 'red'],
  ])('hexa(%s, %s) returns %s', (hex, transparency, expected) => {
    expect(hexa(hex, transparency)).toBe(expected);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3044: transparency values below 16/255 return a single hex digit, eg. #ff00005 for 0.02, which is not a valid colour.
  it.fails('pads the alpha channel to two hex digits', () => {
    expect(hexa('#ff0000', 0.02)).toBe('#ff000005');
  });
});
