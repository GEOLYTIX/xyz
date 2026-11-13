import { describe, expect, it, vi } from 'vitest';
import { entry, lidlLocation, scratchLocation } from '../helpers.mjs';

const { infoj } = mapp.ui.locations;

/**
Returns the trimmed text of the value element in an entry node.
*/
function val(entry) {
  return entry.node.querySelector('.val').textContent.trim();
}

describe('ui/locations/infoj', () => {
  it('returns without a location infoj', () => {
    expect(infoj({})).toBeUndefined();
  });

  it('creates a grid with a node for each entry of the location', async () => {
    const { location } = await lidlLocation();

    const grid = location.viewEntries;

    expect(grid.classList).toContain('location-view-grid');

    expect(entry(location, 'retailer').node.parentElement).toBe(grid);
    expect(entry(location, 'retailer').node.dataset.type).toBe('text');
    expect(entry(location, 'retailer').node.classList).toContain('inline');
    expect(
      entry(location, 'retailer').node.querySelector('.label').textContent,
    ).toBe('Retailer');

    expect(val(entry(location, 'retailer'))).toBe('Lidl');
    expect(val(entry(location, 'store_name'))).toBe('Lidl Walworth Road');
    expect(val(entry(location, 'postcode'))).toBe('SE17 2TG');

    // The first entries are the key and the pin.
    expect([...grid.children].slice(0, 3).map((el) => el.dataset.type)).toEqual(
      ['key', 'pin', 'text'],
    );
  });

  it('assigns the field or an index as the entry key', async () => {
    const { location } = await lidlLocation();

    // The key entry has no field.
    expect(location.infoj[0].key).toBe(0);
    expect(entry(location, 'retailer').key).toBe('retailer');
  });

  it('skips entries by their skip flags and value', async () => {
    const { location } = await lidlLocation();

    const entries = [
      { key: 'skip', value: 'a', skipEntry: true },
      { key: 'falsy', value: 0, skipFalsyValue: true },
      { key: 'undefined', skipUndefinedValue: true },
      { key: 'null', value: null, skipNullValue: true },
      // An editable entry is not skipped for its value.
      { key: 'edit', value: null, skipNullValue: true, edit: true },
      { key: 'value', value: 'a', skipNullValue: true, skipFalsyValue: true },
    ];

    infoj(location, entries);

    expect(entries.map((entry) => !!entry.node)).toEqual([
      false,
      false,
      false,
      false,
      true,
      true,
    ]);

    expect(entries[4].edit).toEqual({});
    expect(entries[4].location).toBe(location);
  });

  it('assigns the nullValue to entries which are not editable', async () => {
    const { location } = await lidlLocation();

    const entries = [
      { key: 'null', value: null, nullValue: 'n/a' },
      { key: 'value', value: 'a', nullValue: 'n/a' },
      { key: 'edit', value: null, nullValue: 'n/a', edit: true },
    ];

    infoj(location, entries);

    expect(val(entries[0])).toBe('n/a');
    expect(val(entries[1])).toBe('a');
    expect(entries[2].value).toBeNull();
  });

  it('assigns the default as newValue of an editable entry without a value', async () => {
    const { location } = await scratchLocation();

    const entries = [
      { field: 'category', value: null, default: 'b', edit: true },
      { field: 'name', value: 'Scratch', default: 'b', edit: true },
      { field: 'tag', value: null, default: 'b' },
    ];

    infoj(location, entries);

    expect(entries[0].newValue).toBe('b');
    expect(entries[0].node.querySelector('input').value).toBe('b');
    expect(entries[1].newValue).toBeUndefined();
    expect(entries[2].newValue).toBeUndefined();
  });

  it('adds the entries of a group to a group drawer', async () => {
    const { location } = await lidlLocation();

    const entries = [
      { key: 'a', value: 'a', group: 'Address', expanded: true },
      { key: 'b', value: 'b', group: 'Address', groupClassList: 'ignored' },
      { key: 'c', value: 'c' },
    ];

    const grid = infoj(location, entries);

    const drawers = grid.querySelectorAll('[data-id=location-infoj-group]');

    expect(drawers.length).toBe(1);
    expect(drawers[0].classList).toContain('group');
    expect(drawers[0].querySelector('.header h3').textContent).toBe('Address');
    expect(entries[0].node.parentElement).toBe(drawers[0]);
    expect(entries[1].node.parentElement).toBe(drawers[0]);
    expect(entries[2].node.parentElement).toBe(grid);
  });

  it('adds the entry class and a title with a tooltip to the node', async () => {
    const { location } = await lidlLocation();

    const entries = [
      {
        key: 'a',
        value: 'a',
        title: 'Title',
        class: 'custom',
        tooltip: 'Tip',
        css_title: 'font-weight: 800;',
      },
    ];

    infoj(location, entries);

    const label = entries[0].node.querySelector('.label');

    expect(entries[0].node.className).toContain('contents text custom');
    expect(label.firstChild.textContent).toBe('Title');
    expect(label.style.fontWeight).toBe('800');
    expect(label.contains(entries[0].tooltipElement)).toBe(true);
  });

  it('orders and filters the entries with the infoj_order', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { location } = await lidlLocation((layers) => {
      layers.retail_points.infoj_order = [
        'postcode',
        'retailer',
        'unknown',
        { key: 'extra', title: 'Extra', value: 'spliced' },
      ];
    });

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('infoj_order field: "unknown" not found'),
    );

    warn.mockRestore();

    expect(
      [...location.viewEntries.children].map(
        (el) => el.querySelector('.label').textContent,
      ),
    ).toEqual(['Postcode', 'Retailer', 'Extra']);

    // Entries which are not in the infoj_order are not processed.
    expect(entry(location, 'store_name').node).toBeUndefined();
  });

  it('logs an error for an entry type without a method', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { location } = await lidlLocation();

    const entries = [{ key: 'a', value: 'a', type: 'unknown' }];

    infoj(location, entries);

    expect(error).toHaveBeenCalledWith('entry.type:unknown method not found.');

    error.mockRestore();
  });

  it('assigns a jsonb key value and a json_field key value', async () => {
    const { location } = await scratchLocation(null, {
      name: 'Json',
      meta: { colour: 'red' },
    });

    expect(entry(location, 'colour').node.querySelector('input').value).toBe(
      'red',
    );
  });

  it('does not process the entries of a disabled view', async () => {
    const { location } = await lidlLocation();

    location.view.classList.add('disabled');

    expect(infoj(location).children.length).toBe(0);
  });
});
