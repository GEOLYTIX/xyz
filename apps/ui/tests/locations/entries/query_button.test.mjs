import { describe, expect, it, vi } from 'vitest';
import { entry, lidlLocation } from '../../helpers.mjs';
import { stubEntry } from './_helpers.mjs';

const { query_button } = mapp.ui.locations.entries;

/**
Creates a query_button entry for the distinct_values query of the retailer field of the location layer.
*/
function retailerButton(location, params) {
  return {
    location,
    query: 'distinct_values',
    queryparams: { field: 'retailer', table: true },
    ...params,
  };
}

/**
Resolves with the location view after its next updateInfo event.
*/
function updateInfo(location) {
  return new Promise((resolve) =>
    location.view.addEventListener('updateInfo', resolve, { once: true }),
  );
}

describe('ui/locations/entries/query_button', () => {
  it('warns and returns without a query', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { entry } = stubEntry();

    expect(query_button(entry)).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'You must provide a query to use "type": "query_button".',
    );
  });

  it('returns a button with the label or the query', () => {
    const { entry } = stubEntry({ query: 'q' });

    const button = query_button(entry);

    expect(button.tagName).toBe('BUTTON');
    expect(button.classList).toContain('wide');
    expect(button.textContent).toBe('Run query:q');

    const labelled = stubEntry({ query: 'q', label: 'Run' });

    expect(query_button(labelled.entry).textContent).toBe('Run');
  });

  it('runs the query and assigns the response as value', async () => {
    const { location } = await lidlLocation();

    const button_entry = retailerButton(location);

    const button = query_button(button_entry);

    const updated = updateInfo(location);

    button.click();

    expect(location.view.classList).toContain('disabled');

    await updated;

    expect(button_entry.value).toContainEqual({ retailer: 'Lidl' });
    expect(button_entry.queryparams.template).toBe('distinct_values');
    expect(button_entry.host).toBe(`${mapp.host}/api/query`);
    expect(location.view.classList).not.toContain('disabled');
  });

  it('shows the alert, reloads the layer and syncs the dependents', async () => {
    const alert = vi
      .spyOn(mapp.ui.elements, 'alert')
      .mockImplementation(() => {});

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { layer, location } = await lidlLocation();

    const reload = vi.spyOn(layer, 'reload').mockImplementation(() => {});

    const syncFields = vi.spyOn(location, 'syncFields');

    entry(location, 'postcode').value = 'changed';

    const button_entry = retailerButton(location, {
      alert: 'Done',
      reload: true,
      updated_fields: ['postcode'],
    });

    const updated = updateInfo(location);

    query_button(button_entry).click();

    await updated;

    expect(warn).toHaveBeenCalledWith(
      'entry.updated_fields is deprecated, please use entry.dependents instead.',
    );
    expect(button_entry.dependents).toEqual(['postcode']);
    expect(alert).toHaveBeenCalledWith({ text: 'Done' });
    expect(reload).toHaveBeenCalled();
    expect(syncFields).toHaveBeenCalledWith(['postcode']);
    expect(entry(location, 'postcode').value).toBe('SE17 2TG');
  });

  it('alerts and enables the view for a failed query', async () => {
    const alert = vi
      .spyOn(mapp.ui.elements, 'alert')
      .mockImplementation(() => {});

    const { location } = await lidlLocation();

    const button_entry = retailerButton(location, {
      query: 'no_such_template',
      host: `${mapp.host}/api/query`,
    });

    const updateInfo = vi.fn();

    location.view.addEventListener('updateInfo', updateInfo);

    query_button(button_entry).click();

    await vi.waitFor(() =>
      expect(alert).toHaveBeenCalledWith({
        text: mapp.dictionary.query_failed,
      }),
    );

    expect(location.view.classList).not.toContain('disabled');
    expect(button_entry.value).toBeUndefined();
    expect(updateInfo).not.toHaveBeenCalled();
  });
});
