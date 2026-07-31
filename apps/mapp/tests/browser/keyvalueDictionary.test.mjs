/**
## /tests/browser/keyvalueDictionary

The mapview decorator runs `mapp.utils.keyvalue_dictionary` over the locale
before anything else, so layer names and infoj titles carry their substituted
values by the time the mapview exists.

The codi suite asserted this against whichever workspace the instance happened
to be serving, reading an `OSM` layer and a `changeEnd` layer out of
`mapview.locale.layers` by name. That made the test a statement about a
deployment rather than about the decorator. The locale here is a fixture, so the
assertion is about the code.

The substitution itself is unit tested in
`tests/lib/utils/keyvalue_dictionary.test.mjs`. This test only covers the wiring
of that utility into mapview decoration, which needs a real mapview.

@module /tests/browser/keyvalueDictionary
*/

import { afterEach, describe, expect, it } from 'vitest';
import { createMapview } from './fixtures/mapview.mjs';

describe('mapview keyvalue dictionary', () => {
  let mapview;

  afterEach(() => {
    mapview?.remove();
    mapview = undefined;
  });

  it('substitutes locale values during decoration', async () => {
    mapview = await createMapview({
      locale: {
        keyvalue_dictionary: [
          {
            default: 'OpenStreetMap KeyValue Dictionary',
            key: 'name',
            value: 'OSM',
          },
          {
            default: 'TextArea KeyValue Dictionary',
            key: 'title',
            value: 'TextArea',
          },
        ],
        layers: [
          {
            infoj: [{ field: 'textarea', title: 'TextArea' }],
            key: 'changeEnd',
            name: 'OSM',

            // Array values are left alone.
            test_array: ['TEST KEYVALUE'],
          },
        ],
      },
    });

    const [layer] = mapview.locale.layers;

    expect(layer.name).toEqual('OpenStreetMap KeyValue Dictionary');
    expect(layer.infoj[0].title).toEqual('TextArea KeyValue Dictionary');
    expect(layer.test_array).toEqual(['TEST KEYVALUE']);
  });
});
