import { describe, expect, it, vi } from 'vitest';
import { addLayers, createMapview, getLocale, getRecord } from '../helpers.mjs';

async function scratchLayer() {
  const locale = await getLocale('scratch');

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapview.layers.scratch_location;
}

const FEATURE = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-0.094762, 51.486849] },
};

/**
Resolves with the location which the create method gets once the new record is inserted.
*/
async function created(layer) {
  await expect
    .poll(() => Object.values(layer.mapview.locations).length)
    .toBe(1);

  return Object.values(layer.mapview.locations)[0];
}

function entry(location, field) {
  return location.infoj.find((entry) => entry.field === field);
}

describe('location create', () => {
  it('inserts a record with the feature geometry and gets the location', async () => {
    const layer = await scratchLayer();

    await mapp.location.create(FEATURE, {}, layer);

    const location = await created(layer);

    expect(location.new).toBe(true);
    expect(location.table).toBe('example.scratch_location');
    expect(entry(location, 'coords').value).toEqual([-0.094762, 51.486849]);

    // The record is in the table.
    const record = await getRecord(layer, location.id);

    expect(record.id).toBe(Number(location.id));

    location.remove();
  });

  it('inserts the interaction and layer draw defaults', async () => {
    const layer = await scratchLayer();

    layer.draw = { defaults: { size: 10 } };

    await mapp.location.create(
      FEATURE,
      { defaults: { name: 'Drawn', category: 'point' } },
      layer,
    );

    const location = await created(layer);

    expect(entry(location, 'name').value).toBe('Drawn');
    expect(entry(location, 'category').value).toBe('point');
    expect(entry(location, 'size').value).toBe(10);

    location.remove();
  });

  it('assigns interaction properties as defaults with default_fields', async () => {
    const layer = await scratchLayer();

    const interaction = {
      default_fields: { name: 'title' },
      title: 'From interaction',
    };

    await mapp.location.create(FEATURE, interaction, layer);

    expect(interaction.defaults).toEqual({ name: 'From interaction' });

    const location = await created(layer);

    expect(entry(location, 'name').value).toBe('From interaction');

    location.remove();
  });

  it('reloads the layer and dispatches the changeEnd event', async () => {
    const layer = await scratchLayer();

    const reload = vi.spyOn(layer, 'reload');
    const changeEnd = vi.fn();

    layer.mapview.Map.getTargetElement().addEventListener(
      'changeEnd',
      changeEnd,
    );

    await mapp.location.create(FEATURE, {}, layer);

    expect(reload).toHaveBeenCalled();
    expect(changeEnd).toHaveBeenCalled();

    (await created(layer)).remove();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3028: mapp.utils.xhr resolves with the Error of a failed request and doesn't reject. The try/catch in createLocation can't catch a failed insert, and mapp.location.get is called with the Error as location.id.
  it.fails(
    'alerts and does not get a location if the insert fails',
    async () => {
      const layer = await scratchLayer();

      const alert = vi.spyOn(mapp.utils, 'alert').mockImplementation(() => {});
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});
      const get = vi.spyOn(mapp.location, 'get');

      // The table has no unknown column.
      await mapp.location.create(
        FEATURE,
        { defaults: { unknown: 'value' } },
        layer,
      );

      expect(alert).toHaveBeenCalledWith({
        text: mapp.dictionary.location_new_failed,
      });
      expect(error).toHaveBeenCalled();
      expect(get).not.toHaveBeenCalled();

      vi.restoreAllMocks();
    },
  );

  it('does not insert a record without a feature', async () => {
    const layer = await scratchLayer();

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    expect(await mapp.location.create(null, {}, layer)).toBeUndefined();
    expect(xhr).not.toHaveBeenCalled();

    xhr.mockRestore();
  });
});
