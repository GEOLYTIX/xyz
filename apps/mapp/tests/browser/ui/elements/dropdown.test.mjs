/**
## /tests/browser/ui/elements/dropdown

The codi suite asserted a `div.head` / `ul` / `li` structure. The dropdown has
since been rebuilt on a native `<select>` with `<option>` children and a
placeholder option, so those assertions describe an element that no longer
exists. They are replaced rather than ported.

The element is built with uhtml, whose attribute placeholders use a non ASCII
attribute name. Neither happy-dom nor jsdom keeps such an attribute, so the
template parse fails outside a real browser. This is why the UI element tests
live in the `browser` project.

@module /tests/browser/ui/elements/dropdown
*/

import { describe, expect, it } from 'vitest';

/**
@function entries

@description
Three options, the first selected.

@returns {Array} Dropdown entries.
*/
const entries = () => [
  { field: 'ting_field_1', option: 'ting_1', selected: true, title: 'ting_1' },
  { field: 'ting_field_2', option: 'ting_2', selected: false, title: 'ting_2' },
  { field: 'ting_field_3', option: 'ting_3', selected: false, title: 'ting_3' },
];

describe('ui/elements/dropdown', () => {
  it('builds a select with a placeholder and one option per entry', () => {
    const node = mapp.ui.elements.dropdown({ entries: entries() });

    const select = node.querySelector('select.select-dropdown');

    expect(select).not.toBeNull();

    // One option per entry, plus the placeholder at index 0.
    expect(select.querySelectorAll('option')).toHaveLength(4);
  });

  it('drops entries with an empty option value', () => {
    const node = mapp.ui.elements.dropdown({
      entries: [...entries(), { option: '', title: 'empty' }],
    });

    expect(node.querySelectorAll('option')).toHaveLength(4);
  });

  it('marks a preselected entry as selected', () => {
    const node = mapp.ui.elements.dropdown({ entries: entries() });

    const selected = node.querySelectorAll('option.selected');

    expect(selected).toHaveLength(1);
    expect(selected[0].value).toEqual('ting_1');
  });

  it('shows the placeholder when nothing is selected', () => {
    const node = mapp.ui.elements.dropdown({
      entries: entries().map((entry) => ({ ...entry, selected: false })),
      placeholder: 'Pick one',
    });

    expect(node.querySelector('option').textContent).toContain('Pick one');
  });

  it('shows the selected titles in place of the placeholder', () => {
    const node = mapp.ui.elements.dropdown({
      entries: entries(),
      placeholder: 'Pick one',
    });

    expect(node.querySelector('option').textContent).toContain('ting_1');
  });

  it('keeps the placeholder when keepPlaceholder is set', () => {
    const node = mapp.ui.elements.dropdown({
      entries: entries(),
      keepPlaceholder: true,
      placeholder: 'Pick one',
    });

    expect(node.querySelector('option').textContent).toContain('Pick one');
  });

  it('calls back with the entry on change', () => {
    const calls = [];

    const node = mapp.ui.elements.dropdown({
      callback: (event, entry) => calls.push(entry),
      entries: entries(),
    });

    const select = node.querySelector('select');

    // Index 0 is the placeholder, so the second entry sits at index 2.
    select.selectedIndex = 2;
    select.dispatchEvent(new Event('change'));

    expect(calls).toHaveLength(1);
    expect(calls[0].option).toEqual('ting_2');
  });

  it('sets the multiple attribute when configured', () => {
    const node = mapp.ui.elements.dropdown({
      entries: entries(),
      multiple: true,
    });

    expect(node.querySelector('select').multiple).toBe(true);
  });
});
