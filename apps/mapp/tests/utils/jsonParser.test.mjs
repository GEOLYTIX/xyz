import { describe, expect, it } from 'vitest';
import jsonParser from '../../lib/utils/jsonParser.mjs';

describe('utils/jsonParser', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.jsonParser).toBe(jsonParser);
  });

  it.each([
    ['undefined', undefined],
    ['a string', 'str'],
    ['a number', 1],
  ])('returns undefined for %s', (_, value) => {
    expect(jsonParser(value)).toBeUndefined();
  });

  it('copies primitive values', () => {
    expect(
      jsonParser({
        str: 'a',
        num: 1,
        zero: 0,
        yes: true,
        no: false,
        nil: null,
        undef: undefined,
      }),
    ).toEqual({
      str: 'a',
      num: 1,
      zero: 0,
      yes: true,
      no: false,
      nil: null,
    });
  });

  it('copies nested objects and arrays', () => {
    const source = {
      nested: { deep: { value: 1 } },
      list: [1, 'a', { b: 2 }],
    };

    const result = jsonParser(source);

    expect(result).toEqual(source);
    expect(result.nested).not.toBe(source.nested);
    expect(result.list[2]).not.toBe(source.list[2]);
  });

  it('excludes the mapview, functions, class instances and elements', () => {
    class Instance {}

    expect(
      jsonParser({
        key: 'locale',
        mapview: { a: 1 },
        fn: () => {},
        instance: new Instance(),
        element: document.createElement('div'),
        elements: [document.createElement('div')],
        instances: [new Instance()],
        map: new Map(),
      }),
    ).toEqual({ key: 'locale' });
  });

  it('replaces circular references with the object key', () => {
    const locale = { key: 'locale', layers: {} };

    locale.layers.roads = { key: 'roads', locale };

    const result = jsonParser(locale);

    expect(result).toEqual({
      key: 'locale',
      layers: { roads: { key: 'roads', locale: 'locale' } },
    });
  });

  it('skips circular references without a key', () => {
    const obj = { a: 1 };

    obj.self = obj;

    expect(jsonParser(obj)).toEqual({ a: 1 });
  });

  it('excludes arrays of parsed objects', () => {
    const layer = { key: 'roads' };

    const result = jsonParser({ layer, layers: [layer] });

    expect(result).toEqual({ layer: { key: 'roads' } });
  });

  it('removes the parser flags from the source objects', () => {
    const source = { nested: { a: 1 }, list: [{ b: 2 }] };

    const result = jsonParser(source);

    expect(Object.hasOwn(source, '__parsed')).toBe(false);
    expect(Object.hasOwn(source.nested, '__parsed')).toBe(false);
    expect(Object.hasOwn(result, '__parsed')).toBe(false);
    expect(Object.hasOwn(result.nested, '__parsed')).toBe(false);
  });

  it('ignores prototype polluting keys', () => {
    const source = JSON.parse('{"__proto__": {"polluted": true}, "a": 1}');

    expect(jsonParser(source)).toEqual({ a: 1 });
    expect({}.polluted).toBeUndefined();
  });

  it('skips objects without the Object prototype methods', () => {
    const bare = Object.create(null);

    bare.a = 1;

    expect(jsonParser({ bare, b: 2 })).toEqual({ b: 2 });
  });
});
