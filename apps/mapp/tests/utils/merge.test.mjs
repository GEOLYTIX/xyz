import { describe, expect, it, vi } from 'vitest';
import merge from '../../lib/utils/merge.mjs';

describe('utils/merge', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.merge).toBe(merge);
  });

  it('returns the target without sources', () => {
    const target = { a: 1 };

    expect(merge(target)).toBe(target);
  });

  it('merges nested objects into the target', () => {
    const target = { a: 1, nested: { b: 2, c: 3 } };

    const result = merge(target, { nested: { c: 4, d: 5 }, e: 6 });

    expect(result).toBe(target);
    expect(target).toEqual({ a: 1, nested: { b: 2, c: 4, d: 5 }, e: 6 });
  });

  it('merges multiple sources in order', () => {
    expect(merge({}, { a: 1, b: 1 }, { b: 2 }, { c: 3 })).toEqual({
      a: 1,
      b: 2,
      c: 3,
    });
  });

  it('clones a source into an empty target', () => {
    const source = { nested: { a: 1 } };

    const clone = merge({}, source);

    expect(clone).toEqual(source);
    expect(clone.nested).not.toBe(source.nested);
  });

  it('overwrites target arrays with source arrays', () => {
    expect(merge({ arr: [1, 2, 3] }, { arr: [4] })).toEqual({ arr: [4] });
  });

  it.each([
    ['null', null],
    ['true', true],
    ['false', false],
    ['a string', 'str'],
  ])('assigns %s values', (_, value) => {
    expect(merge({ a: { b: 1 } }, { a: value })).toEqual({ a: value });
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3046: target[key] ??= {} keeps a primitive target value, so the source object is dropped.
  it.fails('replaces a primitive target value with a merged object', () => {
    expect(merge({ a: 'str' }, { a: { b: 1 } })).toEqual({ a: { b: 1 } });
  });

  it.each([
    ['a null target', null],
    ['an array target', []],
  ])('skips %s', (_, target) => {
    expect(merge(target, { a: 1 })).toBe(target);
  });

  it('skips non object sources', () => {
    expect(merge({ a: 1 }, null, 'str', [1], { b: 2 })).toEqual({
      a: 1,
      b: 2,
    });
  });

  it('skips sources which are not plain objects', () => {
    class Source {
      a = 1;
    }

    expect(merge({}, new Source())).toEqual({});
  });

  it('ignores prototype polluting keys', () => {
    const source = JSON.parse('{"__proto__": {"polluted": true}, "a": 1}');

    const target = merge({}, source);

    expect(target).toEqual({ a: 1 });
    expect({}.polluted).toBeUndefined();
  });

  it('ignores and warns about HTMLElement values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const element = document.createElement('div');

    expect(merge({}, { el: element, a: 1 })).toEqual({ a: 1 });
    expect(warn).toHaveBeenCalledWith(element);

    warn.mockRestore();
  });
});
