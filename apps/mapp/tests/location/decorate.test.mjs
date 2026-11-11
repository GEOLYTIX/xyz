import { describe, expect, it, vi } from 'vitest';
import {
  addLayers,
  createMapview,
  getLocale,
  getRecord,
  newLocation,
} from '../helpers.mjs';

// Lidl Walworth Road in the grocery locale view.
const LIDL = 1010025395;

/**
Gets the Lidl location from the grocery cluster layer.

The update, trash and create methods write to the layer table and are not tested against the shared devdb.
*/
async function lidl() {
  const locale = await getLocale('grocery');

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  return mapp.location.get({ layer: mapview.layers.retail_points, id: LIDL });
}

function entry(location, field) {
  return location.infoj.find((entry) => entry.field === field);
}

describe('location decorate', () => {
  it('syncs infoj values from the location record', async () => {
    const location = await lidl();

    entry(location, 'store_name').value = 'changed';
    entry(location, 'postcode').value = 'changed';

    await location.syncFields('store_name');

    expect(entry(location, 'store_name').value).toBe('Lidl Walworth Road');
    expect(entry(location, 'postcode').value).toBe('changed');

    await location.syncFields(['postcode']);

    expect(entry(location, 'postcode').value).toBe('SE17 2TG');
  });

  it('removes and restores the edit of infoj entries', async () => {
    const location = await lidl();

    const storeName = entry(location, 'store_name');

    storeName.edit = true;
    storeName.newValue = 'unsaved';

    location.removeEdits();

    expect(storeName.edit).toBeUndefined();
    expect(storeName._edit).toBe(true);
    expect(storeName.newValue).toBeUndefined();

    location.restoreEdits();

    expect(storeName.edit).toBe(true);
    expect(storeName._edit).toBeUndefined();
  });

  it('does not update a location without new values', async () => {
    const location = await lidl();

    const xhr = vi.spyOn(mapp.utils, 'xhr');

    expect(await location.update()).toBeUndefined();
    expect(await location.confirmUpdate()).toBeUndefined();
    expect(xhr).not.toHaveBeenCalled();

    xhr.mockRestore();
  });

  it('does not update a location with an invalid entry', async () => {
    const location = await lidl();

    const alert = vi.spyOn(mapp.utils, 'alert').mockImplementation(() => {});
    const xhr = vi.spyOn(mapp.utils, 'xhr');

    entry(location, 'store_name').newValue = 'invalid';
    entry(location, 'store_name').invalid = true;

    expect(await location.update()).toBeInstanceOf(Error);
    expect(alert).toHaveBeenCalled();
    expect(xhr).not.toHaveBeenCalled();

    alert.mockRestore();
    xhr.mockRestore();
  });

  it('does not update unsaved changes if the confirm is cancelled', async () => {
    const location = await lidl();

    const confirm = vi
      .spyOn(mapp.utils, 'confirm')
      .mockImplementation(async () => false);
    const update = vi.spyOn(location, 'update');

    entry(location, 'store_name').newValue = 'unsaved';

    expect(await location.confirmUpdate()).toBeNull();
    expect(confirm).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();

    confirm.mockRestore();
  });

  it('returns the extent of the displayed location layers', async () => {
    const location = await lidl();

    expect(await location.getExtent()).toBeNull();

    location.Layers.push(
      { display: true, getExtent: () => [0, 0, 10, 10] },
      { display: true, getExtent: async () => [-5, 5, 5, 20] },
      { display: false, getExtent: () => [-100, -100, 100, 100] },
    );

    expect(await location.getExtent()).toEqual([-5, 0, 10, 20]);
  });

  it('removes the location from the mapview', async () => {
    const location = await lidl();

    const mapview = location.layer.mapview;

    const reload = vi.spyOn(location.layer, 'reload');
    const removed = vi.fn();
    location.removeCallbacks.push(removed);

    // A location layer is removed from the map.
    const L = new ol.layer.Vector({ source: new ol.source.Vector() });
    mapview.Map.addLayer(L);
    location.Layers.push({ L });

    location.view = document.createElement('div');
    document.body.append(location.view);

    location.remove();

    expect(mapview.locations[location.hook]).toBeUndefined();
    expect(location.remove).toBeUndefined();
    expect(location.view.isConnected).toBe(false);
    expect(location.Layers).toEqual([]);
    expect(mapview.Map.getLayers().getArray()).not.toContain(L);
    expect(mapview.interaction.type).toBe('highlight');
    expect(reload).toHaveBeenCalled();
    expect(removed).toHaveBeenCalledWith(location);
  });
});

/**
Gets a location for a new record in the scratch_location table. Each test has its own record, because all test files of a run share the devdb.
*/
async function scratch(values = { name: 'Scratch', category: 'a', size: 1 }) {
  const locale = await getLocale('scratch');

  const mapview = await createMapview(locale, locale.view);

  await addLayers(mapview);

  const layer = mapview.layers.scratch_location;

  const id = await newLocation(layer, values);

  return mapp.location.get({ layer, id });
}

describe('location update', () => {
  it('updates the record with the new values', async () => {
    const location = await scratch();

    entry(location, 'category').newValue = 'b';
    entry(location, 'size').newValue = 42;

    await location.update();

    expect(entry(location, 'category').value).toBe('b');
    expect(entry(location, 'category').newValue).toBeUndefined();
    expect(entry(location, 'size').value).toBe(42);

    const record = await getRecord(location.layer, location.id);

    expect(record.category).toBe('b');
    expect(record.size).toBe(42);
    expect(record.name).toBe('Scratch');
  });

  it('updates a value to null', async () => {
    const location = await scratch();

    entry(location, 'category').newValue = null;

    await location.update();

    expect((await getRecord(location.layer, location.id)).category).toBeNull();
  });

  // https://github.com/GEOLYTIX/xyz/issues/3029: the location_update template escaped quotes and passed the escaped string as a query parameter, so the record value had doubled quotes. Fixed by passing body values as query params.
  it('stores string values with quotes', async () => {
    const location = await scratch();

    entry(location, 'name').newValue = "O'Brien's";

    await location.update();

    expect((await getRecord(location.layer, location.id)).name).toBe(
      "O'Brien's",
    );
  });

  // https://github.com/GEOLYTIX/xyz/issues/3068: a newValue set while the update request is pending was not sent but was still marked as saved and cleared, losing the edit.
  it('keeps a newValue set while the update request is pending', async () => {
    const location = await scratch();

    const category = entry(location, 'category');
    const size = entry(location, 'size');

    category.newValue = 'b';

    // Isolate the reconciliation from the layer reload and dependent sync.
    vi.spyOn(location, 'syncFields').mockImplementation(async () => {});
    vi.spyOn(location.layer, 'reload').mockImplementation(() => {});
    vi.spyOn(
      location.layer.mapview.interactions,
      'highlight',
    ).mockImplementation(() => {});

    // A concurrent edit sets another newValue while the update request is pending.
    vi.spyOn(mapp.utils, 'xhr').mockImplementation(async () => {
      size.newValue = 99;
      return 1;
    });

    await location.update();

    // The value sent with the request is saved and its newValue cleared.
    expect(category.value).toBe('b');
    expect(category.newValue).toBeUndefined();

    // The edit made while the request was pending was not sent, so it is kept.
    expect(size.newValue).toBe(99);
    expect(size.value).not.toBe(99);
  });

  it('syncs the dependent fields of updated entries', async () => {
    const location = await scratch();

    expect(entry(location, 'name_upper').value).toBe('SCRATCH');

    entry(location, 'name').newValue = 'Renamed';

    await location.update();

    expect(entry(location, 'name_upper').value).toBe('RENAMED');
  });

  it('reloads the dependent layers of updated entries', async () => {
    const location = await scratch();

    const reload = vi.spyOn(location.layer, 'reload');

    entry(location, 'size').newValue = 2;

    await location.update();

    // The location layer is reloaded after every update.
    expect(reload).toHaveBeenCalledTimes(1);

    entry(location, 'category').newValue = 'c';

    await location.update();

    // The category entry has the location layer as dependents_layers.
    expect(reload).toHaveBeenCalledTimes(3);
  });

  it('updates a key of a jsonb field', async () => {
    const location = await scratch({ name: 'jsonb', props: { other: 1 } });

    entry(location, 'tag').newValue = 'red';

    await location.update();

    expect(entry(location, 'tag').value).toEqual({
      jsonb: { props: { tag: 'red' } },
    });

    const record = await getRecord(location.layer, location.id);

    // The other keys of the jsonb field are kept.
    expect(record.tag).toBe('red');
  });

  it('updates a json field with the json_key entries', async () => {
    const location = await scratch({ name: 'json', meta: { size: 'S' } });

    entry(location, 'colour').newValue = 'blue';

    await location.update();

    // The json_key entry value is assigned to the json_field entry.
    expect(entry(location, 'meta').value).toEqual({
      size: 'S',
      colour: 'blue',
    });
    expect(entry(location, 'colour').newValue).toBeUndefined();

    const record = await getRecord(location.layer, location.id);

    expect(record.meta).toEqual({ size: 'S', colour: 'blue' });
    expect(record.colour).toBe('blue');
  });

  it('updates the geometry', async () => {
    const location = await scratch({
      name: 'geom',
      geom: { type: 'Point', coordinates: [0, 51] },
    });

    entry(location, 'geom').newValue = {
      type: 'Point',
      coordinates: [-0.1, 51.5],
    };

    await location.update();

    expect((await getRecord(location.layer, location.id)).coords).toEqual([
      -0.1, 51.5,
    ]);
  });

  it('calls the updateCallbacks or the callback argument', async () => {
    const location = await scratch();

    const updateCallback = vi.fn();
    location.updateCallbacks.push(updateCallback);

    entry(location, 'size').newValue = 3;

    await location.update();

    expect(updateCallback).toHaveBeenCalledWith(location);

    const callback = vi.fn();

    entry(location, 'size').newValue = 4;

    await location.update(callback);

    expect(callback).toHaveBeenCalledWith(location);
    expect(updateCallback).toHaveBeenCalledTimes(1);
  });

  it('updates unsaved changes if the confirm is confirmed', async () => {
    const location = await scratch();

    const confirm = vi
      .spyOn(mapp.utils, 'confirm')
      .mockImplementation(async () => true);

    entry(location, 'name').newValue = 'Confirmed';

    expect(await location.confirmUpdate()).toBe(true);
    expect(confirm).toHaveBeenCalledWith({
      text: mapp.dictionary.location_save_changes,
    });

    expect((await getRecord(location.layer, location.id)).name).toBe(
      'Confirmed',
    );

    confirm.mockRestore();
  });

  it('alerts if the update query fails', async () => {
    const location = await scratch();

    const alert = vi.spyOn(mapp.utils, 'alert').mockImplementation(() => {});

    location.view = document.createElement('div');
    location.view.classList.add('disabled');

    // The name_upper fieldfx is not a column of the table.
    entry(location, 'name_upper').newValue = 'invalid';

    expect(await location.update()).toBeUndefined();

    expect(alert).toHaveBeenCalledWith({
      text: mapp.dictionary.location_update_failed,
    });
    expect(location.view.classList).not.toContain('disabled');

    // The new value is kept for another update.
    expect(entry(location, 'name_upper').newValue).toBe('invalid');

    alert.mockRestore();
  });
});

describe('location trash', () => {
  it('deletes the record and removes the location', async () => {
    const location = await scratch();

    const confirm = vi
      .spyOn(mapp.utils, 'confirm')
      .mockImplementation(async () => true);

    const { layer, id, hook } = location;

    await location.trash();

    expect(confirm).toHaveBeenCalledWith({
      text: mapp.dictionary.confirm_delete,
    });
    expect(layer.mapview.locations[hook]).toBeUndefined();
    expect(await getRecord(layer, id)).toBeNull();

    confirm.mockRestore();
  });

  it('keeps the record if the confirm is cancelled', async () => {
    const location = await scratch();

    const confirm = vi
      .spyOn(mapp.utils, 'confirm')
      .mockImplementation(async () => false);

    await location.trash();

    expect(location.layer.mapview.locations[location.hook]).toBe(location);
    expect(await getRecord(location.layer, location.id)).not.toBeNull();

    confirm.mockRestore();
  });
});
