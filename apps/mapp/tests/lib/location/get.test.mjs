/**
## /tests/lib/location/get

The codi suite added a real GeoJSON layer to a live mapview and queried a
`get_location_mock` template through the XYZ API. Both are replaced here by a
stub layer with `featureLocation: true`, which is the branch in
`getFeatureResponse` that resolves a location from features already held on the
layer rather than from a request. No network, no mapview.

@module /tests/lib/location/get
*/

import { beforeEach, describe, expect, it } from 'vitest';
import { mockConsole } from '../../scaffold.mjs';

mockConsole('warn');

/**
@function stubMapview

@description
The mapview properties the location get and decorate methods read.

@returns {Object} A stub mapview.
*/
const stubMapview = () => ({
  Map: {
    addLayer: () => {},
    removeLayer: () => {},
  },
  hooks: false,

  // location.remove() restores the highlight interaction.
  interactions: { highlight: () => {} },
  locale: { key: 'locale' },
  locations: {},
});

/**
@function stubLayer

@description
A layer holding its own features, so a location resolves without a request.

@param {Object} [params] Properties merged over the defaults.

@returns {Object} A stub layer.
*/
const stubLayer = (params = {}) => ({
  featureLocation: true,
  features: [
    {
      geometry: { coordinates: [0, 0], type: 'Point' },
      properties: { id: 6, name: 'Shop' },
    },
  ],
  infoj: [{ field: 'name', title: 'Name', type: 'text' }],
  key: 'location_mock',
  mapview: stubMapview(),
  qID: 'id',
  ...params,
});

describe('location/get', () => {
  let layer;

  beforeEach(() => {
    layer = stubLayer();
  });

  it('builds a hook from the layer key and the location id', async () => {
    const location = await mapp.location.get({ id: 6, layer });

    expect(location.hook).toEqual('location_mock!6');
    expect(location.layer).toBeInstanceOf(Object);
  });

  it('assigns the located record to the mapview locations', async () => {
    const location = await mapp.location.get({ id: 6, layer });

    expect(layer.mapview.locations[location.hook]).toBe(location);
  });

  it('populates the infoj from the feature properties', async () => {
    const location = await mapp.location.get({ id: 6, layer });

    const entry = location.infoj.find((entry) => entry.field === 'name');

    expect(entry.value).toEqual('Shop');
  });

  it('removes an already listed location instead of adding it twice', async () => {
    const location = await mapp.location.get({ id: 6, layer });

    // Requesting the same location again toggles it back out of the list.
    const repeat = await mapp.location.get({ id: 6, layer });

    expect(repeat).toBeUndefined();
    expect(layer.mapview.locations[location.hook]).toBeUndefined();
  });

  it('runs and clears removeCallbacks on remove', async () => {
    const location = await mapp.location.get({ id: 6, layer });

    location.removeCallbacks.push((_this) => delete _this.removeCallbacks);

    location.remove();

    expect(layer.mapview.locations[location.hook]).toBeUndefined();
    expect(location.removeCallbacks).toBeUndefined();
  });

  it('returns undefined when the layer carries no infoj', async () => {
    const location = await mapp.location.get({
      id: 6,
      layer: stubLayer({ infoj: undefined }),
    });

    expect(location).toBeUndefined();
  });

  it('returns undefined without an id', async () => {
    expect(await mapp.location.get({ layer })).toBeUndefined();
  });

  it('defers to a getLocation method on the current interaction', async () => {
    const calls = [];

    layer.mapview.interaction = {
      getLocation: (location) => calls.push(location),
    };

    const location = await mapp.location.get({ id: 6, layer });

    expect(location).toBeUndefined();
    expect(calls).toHaveLength(1);
  });

  describe('getInfoj', () => {
    it('returns a populated infoj for a layer without one on the location', async () => {
      const infoj = await mapp.location.getInfoj({
        id: 6,
        layer,
        locale: 'locale',
      });

      expect(infoj).toBeDefined();
      expect(infoj.find((entry) => entry.field === 'name').value).toEqual(
        'Shop',
      );
    });

    it('warns and returns undefined without a layer', async () => {
      expect(await mapp.location.getInfoj({ id: 6 })).toBeUndefined();
    });
  });
});
