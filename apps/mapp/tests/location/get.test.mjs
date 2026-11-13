import { describe, expect, it, vi } from 'vitest';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

// Lidl Walworth Road in the grocery locale view.
const LIDL = 1010025395;

async function retailPoints() {
  const locale = await getLocale('grocery');

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapview.layers.retail_points;
}

function entry(location, field) {
  return location.infoj.find((entry) => entry.field === field);
}

describe('location get', () => {
  it('gets the location of a single store cluster feature', async () => {
    const layer = await retailPoints();

    // A cluster feature with one store has the id of the store.
    const feature = layer.cluster.source
      .getFeatures()
      .find((F) => F.get('features').length === 1);

    const location = await mapp.location.get({
      layer,
      id: feature.get('id'),
    });

    expect(location.hook).toBe(`retail_points!${feature.get('id')}`);
    // The location pin is the store of the cluster feature.
    const pin = ol.proj.fromLonLat(entry(location, 'pin').value);

    feature
      .getGeometry()
      .getCoordinates()
      .forEach((coord, i) => expect(coord).toBeCloseTo(pin[i], 0));
  });

  it('assigns the location record values to the infoj entries', async () => {
    const layer = await retailPoints();

    const location = await mapp.location.get({ layer, id: LIDL });

    expect(location.locale).toBe('grocery');
    expect(location.table).toBe('geodata.uk_glx_open_retail_points');
    expect(location.layer.mapview.locations[location.hook]).toBe(location);

    expect(entry(location, 'retailer').value).toBe('Lidl');
    expect(entry(location, 'store_name').value).toBe('Lidl Walworth Road');
    expect(entry(location, 'postcode').value).toBe('SE17 2TG');
    expect(entry(location, 'add_two').value).toBeNull();
    expect(entry(location, 'pin').value).toEqual([-0.094762, 51.486849]);

    // The infoj entries are clones with a reference to the location.
    expect(entry(location, 'retailer')).not.toBe(layer.infoj[2]);
    expect(entry(location, 'retailer').location).toBe(location);
    expect(entry(location, 'retailer').title).toBe('Retailer');

    expect(typeof location.remove).toBe('function');
  });

  it('removes the location if the location is requested again', async () => {
    const layer = await retailPoints();

    const location = await mapp.location.get({ layer, id: LIDL });

    const removed = vi.fn();
    location.removeCallbacks.push(removed);

    const result = await mapp.location.get({ layer, id: LIDL });

    expect(result).toBeUndefined();
    expect(removed).toHaveBeenCalledWith(location);
    expect(layer.mapview.locations).toEqual({});
  });

  it('alerts if the location query has no record', async () => {
    const layer = await retailPoints();

    const alert = vi.spyOn(mapp.utils, 'alert').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const location = await mapp.location.get({ layer, id: 1 });

    expect(location).toBeUndefined();
    expect(alert).toHaveBeenCalledWith({
      text: 'Get location query for ID:1 on layer: "Grocery" has failed.',
    });
    expect(warn).toHaveBeenCalled();
    expect(layer.mapview.locations).toEqual({});

    alert.mockRestore();
    warn.mockRestore();
  });

  it('passes the location to the getLocation method of the interaction', async () => {
    const layer = await retailPoints();

    const getLocation = vi.fn();

    layer.mapview.interaction = { getLocation };

    const location = { layer, id: LIDL };

    expect(await mapp.location.get(location)).toBeUndefined();
    expect(getLocation).toHaveBeenCalledWith(location);
    expect(location.infoj).toBeUndefined();
  });

  it('does not get a location without a layer infoj', async () => {
    const layer = await retailPoints();

    delete layer.infoj;

    expect(await mapp.location.get({ layer, id: LIDL })).toBeUndefined();
  });
});

describe('location getInfoj', () => {
  it('requests the layer from the workspace for a layer key', async () => {
    const location = {
      layer: 'retail_points',
      locale: 'grocery',
      id: LIDL,
    };

    const infoj = await mapp.location.getInfoj(location);

    expect(location.layer.key).toBe('retail_points');
    expect(location.getTemplate).toBe('location_get');
    expect(infoj.find((entry) => entry.field === 'fascia').value).toBe('Lidl');
  });

  it('gets the location from the layer features with featureLocation', async () => {
    const location = {
      id: 2,
      layer: {
        featureLocation: true,
        qID: 'id',
        infoj: [{ field: 'id' }, { field: 'name' }],
        features: [
          { properties: { id: 1, name: 'one' } },
          { properties: { id: 2, name: 'two' } },
        ],
      },
    };

    const infoj = await mapp.location.getInfoj(location);

    expect(infoj.map((entry) => entry.value)).toEqual([2, 'two']);
  });

  it('assigns the qID as infoj for a layer without infoj', async () => {
    const location = {
      id: 1,
      layer: {
        featureLocation: true,
        qID: 'id',
        features: [{ properties: { id: 1 } }],
      },
    };

    const infoj = await mapp.location.getInfoj(location);

    expect(infoj).toHaveLength(1);
    expect(infoj[0]).toMatchObject({ field: 'id', value: 1 });
  });

  it('warns without a layer', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(await mapp.location.getInfoj({ id: 1 })).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'No layer provided for getLocationInfoj()',
    );

    warn.mockRestore();
  });
});
