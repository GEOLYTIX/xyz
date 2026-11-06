import { afterEach, describe, expect, it } from 'vitest';
import { keyvalue_dictionary } from '../../lib/utils/keyvalue_dictionary.mjs';

const dictionary = [
  {
    key: 'name',
    value: 'OSM',
    default: 'OpenStreetMap',
    uk: 'Sława OpenStreetMap',
  },
  {
    key: 'title',
    value: 'NO_DEFAULT',
  },
];

function locale(obj) {
  return { keyvalue_dictionary: structuredClone(dictionary), ...obj };
}

describe('utils/keyvalue_dictionary', () => {
  const language = mapp.language;

  afterEach(() => {
    mapp.language = language;
    delete mapp.user;
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.keyvalue_dictionary).toBe(keyvalue_dictionary);
  });

  it('does nothing without a keyvalue_dictionary', () => {
    const obj = { name: 'OSM' };

    keyvalue_dictionary(obj);

    expect(obj).toEqual({ name: 'OSM' });
  });

  it('replaces matching key value pairs with the default', () => {
    mapp.language = 'en';

    const obj = locale({ name: 'OSM', other: 'OSM' });

    keyvalue_dictionary(obj);

    expect(obj.name).toBe('OpenStreetMap');

    // The key must match as well as the value.
    expect(obj.other).toBe('OSM');
  });

  it('replaces values with the mapp.language entry', () => {
    mapp.language = 'uk';

    const obj = locale({ name: 'OSM' });

    keyvalue_dictionary(obj);

    expect(obj.name).toBe('Sława OpenStreetMap');
  });

  it('prefers the mapp.user language', () => {
    mapp.language = 'en';
    mapp.user = { language: 'uk' };

    const obj = locale({ name: 'OSM' });

    keyvalue_dictionary(obj);

    expect(obj.name).toBe('Sława OpenStreetMap');
  });

  it('keeps the value without a language or default entry', () => {
    const obj = locale({ title: 'NO_DEFAULT' });

    keyvalue_dictionary(obj);

    expect(obj.title).toBe('NO_DEFAULT');
  });

  it('replaces values in nested objects and arrays', () => {
    mapp.language = 'en';

    const obj = locale({
      layers: {
        osm: { name: 'OSM' },
      },
      list: [{ name: 'OSM' }, ['nested', { name: 'OSM' }]],
    });

    keyvalue_dictionary(obj);

    expect(obj.layers.osm.name).toBe('OpenStreetMap');
    expect(obj.list[0].name).toBe('OpenStreetMap');
    expect(obj.list[1][1].name).toBe('OpenStreetMap');
  });

  it('skips the mapview and layer properties', () => {
    mapp.language = 'en';

    const obj = locale({
      mapview: { name: 'OSM' },
      layer: { name: 'OSM' },
    });

    keyvalue_dictionary(obj);

    expect(obj.mapview.name).toBe('OSM');
    expect(obj.layer.name).toBe('OSM');
  });
});
