import { describe, expect, it, vi } from 'vitest';
import {
  entry,
  getRecord,
  LIDL,
  lidlLocation,
  scratchLocation,
} from '../helpers.mjs';

/**
Returns a header button of the location view by its title.
*/
function button(location, title) {
  return location.view.querySelector(`.header button[title="${title}"]`);
}

/**
Returns the input of a text entry in the location view.
*/
function input(location, field) {
  return entry(location, field).node.querySelector('input[type=text]');
}

/**
Types a value into the input of a text entry.
*/
function type(location, field, value) {
  const el = input(location, field);

  el.value = value;

  el.dispatchEvent(new KeyboardEvent('keyup'));
}

/**
Resolves after the updateInfo event of the location view.
*/
function updateInfo(location) {
  return new Promise((resolve) =>
    location.view.addEventListener('updateInfo', resolve, { once: true }),
  );
}

describe('ui/locations/view', () => {
  it('creates an expanded drawer with the record symbol and colour', async () => {
    const { location } = await lidlLocation();

    expect(location.view.dataset.id).toBe(`location-retail_points-${LIDL}`);
    expect(location.view.classList).toContain('location-view');
    expect(location.view.classList).toContain('expanded');
    expect(location.view.querySelector('.header h2').textContent).toBe('A');
    expect(location.view.querySelector('.header').style.borderBottom).toBe(
      '3px solid rgb(46, 111, 158)',
    );
    expect(location.viewEntries.parentElement).toBe(location.view);
    expect(location.viewEntries.classList).toContain('location-view-grid');
  });

  it('creates the zoom, save and remove buttons in the header', async () => {
    const { location } = await lidlLocation();

    // The location has a pin entry with a value.
    expect(button(location, mapp.dictionary.location_zoom)).toBeTruthy();
    expect(button(location, mapp.dictionary.location_remove)).toBeTruthy();
    expect(button(location, mapp.dictionary.location_save).style.display).toBe(
      'none',
    );

    // The layer is not configured for location edits.
    expect(button(location, mapp.dictionary.location_delete)).toBeNull();
    expect(location.editToggle).toBeUndefined();
  });

  it('adds the value of the locationHeader entry to the header', async () => {
    const { location } = await lidlLocation((layers) => {
      layers.retail_points.infoj.find(
        (entry) => entry.field === 'store_name',
      ).locationHeader = true;
    });

    expect(location.view.querySelector('.header h2').textContent).toBe(
      'Lidl Walworth Road - (A)',
    );
  });

  it('flies to the location with the zoom button', async () => {
    const { location } = await lidlLocation();

    const flyTo = vi.spyOn(location, 'flyTo').mockImplementation(() => {});

    button(location, mapp.dictionary.location_zoom).click();

    expect(flyTo).toHaveBeenCalledTimes(1);
  });

  it('removes the location with the remove button', async () => {
    const { layer, location, mapview } = await lidlLocation();

    const confirm = vi.spyOn(mapp.ui.elements, 'confirm');

    button(location, mapp.dictionary.location_remove).click();

    await vi.waitFor(() => expect(location.view.isConnected).toBe(false));

    await layer.loading;

    // The location has no unsaved changes to confirm.
    expect(confirm).not.toHaveBeenCalled();
    expect(mapview.locations[location.hook]).toBeUndefined();

    confirm.mockRestore();
  });

  it('displays the save button for a changed value', async () => {
    const { location } = await scratchLocation();

    const save = button(location, mapp.dictionary.location_save);

    type(location, 'name', 'Changed');

    expect(entry(location, 'name').newValue).toBe('Changed');
    expect(entry(location, 'name').node.classList).toContain('val-changed');
    expect(save.style.display).toBe('inline-block');

    type(location, 'name', 'Scratch');

    // The newValue is the current value.
    expect(entry(location, 'name').newValue).toBeUndefined();
    expect(entry(location, 'name').node.classList).not.toContain('val-changed');
    expect(save.style.display).toBe('none');
  });

  it('does not display the save button with an invalid entry', async () => {
    const { location } = await scratchLocation();

    entry(location, 'category').invalid = true;

    type(location, 'name', 'Changed');

    expect(button(location, mapp.dictionary.location_save).style.display).toBe(
      'none',
    );
  });

  it('calls the valChangeMethod of an entry', async () => {
    const { location } = await scratchLocation();

    const valChangeMethod = vi.fn();

    entry(location, 'name').valChangeMethod = valChangeMethod;

    type(location, 'name', 'Changed');

    expect(valChangeMethod).toHaveBeenCalledWith(entry(location, 'name'));
    expect(entry(location, 'name').node.classList).not.toContain('val-changed');
  });

  it('updates the record and renders the view with the save button', async () => {
    const { layer, location } = await scratchLocation();

    const save = button(location, mapp.dictionary.location_save);

    type(location, 'name', 'Saved');

    const updated = updateInfo(location);

    save.click();

    // The view is disabled during the update.
    expect(location.view.classList).toContain('disabled');

    await updated;

    await layer.loading;

    expect((await getRecord(layer, location.id)).name).toBe('Saved');
    expect(location.view.classList).not.toContain('disabled');
    expect(save.style.display).toBe('none');

    // The view entries are rendered with the updated values.
    expect(location.viewEntries.isConnected).toBe(true);
    expect(input(location, 'name').value).toBe('Saved');
    expect(entry(location, 'name').node.classList).not.toContain('val-changed');

    // The name_upper entry is a dependent of the name entry.
    expect(
      entry(location, 'name_upper')
        .node.querySelector('.val')
        .textContent.trim(),
    ).toBe('SAVED');
  });

  it('confirms the removal of a location with unsaved changes', async () => {
    const { layer, location, mapview } = await scratchLocation();

    const confirm = vi
      .spyOn(mapp.ui.elements, 'confirm')
      .mockImplementation(async () => false);

    type(location, 'name', 'Unsaved');

    button(location, mapp.dictionary.location_remove).click();

    await vi.waitFor(() =>
      expect(confirm).toHaveBeenCalledWith({
        text: mapp.dictionary.location_close_without_save,
      }),
    );

    // The location is not removed if the confirm is cancelled.
    expect(mapview.locations[location.hook]).toBe(location);
    expect(location.view.isConnected).toBe(true);

    confirm.mockImplementation(async () => true);

    button(location, mapp.dictionary.location_remove).click();

    await vi.waitFor(() => expect(location.view.isConnected).toBe(false));

    await layer.loading;

    expect(mapview.locations[location.hook]).toBeUndefined();
    expect((await getRecord(layer, location.id)).name).toBe('Scratch');

    confirm.mockRestore();
  });

  it('deletes the record of the location with the delete button', async () => {
    const { layer, location, mapview } = await scratchLocation((layers) => {
      layers.scratch_location.deleteLocation = true;
    });

    const confirm = vi
      .spyOn(mapp.utils, 'confirm')
      .mockImplementation(async () => true);

    button(location, mapp.dictionary.location_delete).click();

    await vi.waitFor(() => expect(location.view.isConnected).toBe(false));

    await layer.loading;

    expect(mapview.locations[location.hook]).toBeUndefined();
    expect(await getRecord(layer, location.id)).toBeNull();

    confirm.mockRestore();
  });

  describe('toggleLocationViewEdits', () => {
    it('toggles the edits of the location entries', async () => {
      const { location } = await scratchLocation((layers) => {
        layers.scratch_location.toggleLocationViewEdits = true;
      });

      expect(location.editToggle.parentElement).toBe(
        location.view.querySelector('.header'),
      );
      expect(location.editToggle.classList).not.toContain('toggle-on');

      // The entry edits are removed from a location which is not new.
      expect(input(location, 'name')).toBeNull();
      expect(
        entry(location, 'name').node.querySelector('.val').textContent.trim(),
      ).toBe('Scratch');

      location.editToggle.click();

      await vi.waitFor(() =>
        expect(location.editToggle.classList).toContain('toggle-on'),
      );

      expect(input(location, 'name').value).toBe('Scratch');

      location.editToggle.click();

      await vi.waitFor(() =>
        expect(location.editToggle.classList).not.toContain('toggle-on'),
      );

      expect(input(location, 'name')).toBeNull();
    });

    it('toggles the edits off after an update', async () => {
      const { layer, location } = await scratchLocation((layers) => {
        layers.scratch_location.toggleLocationViewEdits = true;
      });

      location.editToggle.click();

      await vi.waitFor(() => expect(input(location, 'name')).toBeTruthy());

      type(location, 'name', 'Toggled');

      const updated = updateInfo(location);

      button(location, mapp.dictionary.location_save).click();

      await updated;

      await layer.loading;

      expect(location.editToggle.classList).not.toContain('toggle-on');
      expect(input(location, 'name')).toBeNull();
      expect(
        entry(location, 'name').node.querySelector('.val').textContent.trim(),
      ).toBe('Toggled');
    });

    it('removes the edits without a toggle for a false flag', async () => {
      const { location } = await scratchLocation((layers) => {
        layers.scratch_location.toggleLocationViewEdits = false;
      });

      expect(location.editToggle).toBeUndefined();
      expect(input(location, 'name')).toBeNull();
    });
  });
});
