import { describe, expect, it, vi } from 'vitest';
import { addLayers, createMapview, getLocale } from '../helpers.mjs';

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
