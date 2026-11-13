import { describe, expect, it } from 'vitest';
import paramString from '../../lib/utils/paramString.mjs';

describe('utils/paramString', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.paramString).toBe(paramString);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty object', {}],
  ])('returns an empty string for %s', (_, params) => {
    expect(paramString(params)).toBe('');
  });

  it.each([
    ['a string', { template: 'wkt' }, 'template=wkt'],
    ['a number', { z: 12 }, 'z=12'],
    ['zero', { z: 0 }, 'z=0'],
    ['true', { filter: true }, 'filter=true'],
    ['an encoded string', { q: 'a b&c' }, 'q=a%20b%26c'],
    ['an array', { fields: ['a', 'b'] }, 'fields=a%2Cb'],
    [
      'an object with an object value',
      { filter: { name: { eq: 'x' } } },
      `filter=${encodeURIComponent('{"name":{"eq":"x"}}')}`,
    ],
  ])('keeps %s', (_, params, expected) => {
    expect(paramString(params)).toBe(expected);
  });

  it.each([
    ['undefined', { a: undefined }],
    ['null', { a: null }],
    ['false', { a: false }],
    ['an empty string', { a: '' }],
    ['the {} string', { a: '{}' }],
    ['an empty array', { a: [] }],
    ['an empty object', { a: {} }],
    ['an object without object values', { a: { b: 1 } }],
    ['an object with empty object values', { a: { b: {} } }],
  ])('filters %s', (_, params) => {
    expect(paramString(params)).toBe('');
  });

  it('joins the params with an ampersand', () => {
    expect(
      paramString({
        template: 'wkt',
        layer: 'roads',
        empty: '',
        z: 0,
      }),
    ).toBe('template=wkt&layer=roads&z=0');
  });
});
