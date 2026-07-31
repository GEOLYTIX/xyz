/**
## /tests/lib/utils/keyvalue_dictionary

@module /tests/lib/utils/keyvalue_dictionary
*/

import { afterEach, describe, expect, it } from 'vitest';

describe('utils/keyvalue_dictionary', () => {
  afterEach(() => {
    // The utility reads the language off the shared mapp global.
    delete mapp.user;
  });

  it('leaves an object without a keyvalue_dictionary untouched', () => {
    const obj = {};

    mapp.utils.keyvalue_dictionary(obj);

    expect(obj).toEqual({});
  });

  it('replaces values with the entry for the user language', () => {
    const obj = {
      keyvalue_dictionary: [
        {
          default: 'OpenStreetMap',
          key: 'firstKey',
          uk: 'Sława OpenStreetMap 🇺🇦',
          value: 'OSM',
        },
        {
          en: 'OpenStreetMap 🇬🇧',
          key: 'secondKey',
          value: 'OpenStreetMap',
        },
      ],
      layers: {
        layer1: {
          firstKey: 'OSM',
          secondKey: 'OpenStreetMap',
        },
      },
    };

    mapp.user = { language: 'uk' };

    mapp.utils.keyvalue_dictionary(obj);

    expect(obj.layers.layer1.firstKey).toEqual('Sława OpenStreetMap 🇺🇦');

    // The second entry has no uk translation and no default, so the original
    // value stands.
    expect(obj.layers.layer1.secondKey).toEqual('OpenStreetMap');
  });
});
