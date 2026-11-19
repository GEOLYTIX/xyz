import { describe, expect, it, vi } from 'vitest';
import { append, stubEntry } from './_helpers.mjs';

const { tab } = mapp.ui.locations.entries;

/**
Appends a tabview element with the data-id to the document. The addTab listener assigns show and remove mocks to the entry, like the Tabview.

@returns {Object} The tabview element and the addTab events.
*/
function tabview(id) {
  const node = append(document.createElement('div'));

  node.dataset.id = id;

  const events = [];

  node.addEventListener('addTab', (e) => {
    e.detail.show = vi.fn();
    e.detail.remove = vi.fn();
    events.push(e.detail);
  });

  return { events, node };
}

describe('ui/locations/entries/tab', () => {
  it('adds the entry as tab to the tabview with the location style', () => {
    const { events } = tabview('tabview');

    const { entry, location } = stubEntry({ target: 'tabview', label: 'Tab' });

    location.style = { strokeColor: '#f00' };

    const chkbox = tab(entry);

    expect(events).toEqual([entry]);
    expect(entry.tab_style).toBe('border-bottom: 3px solid #f00');
    expect(entry.show).not.toHaveBeenCalled();
    expect(chkbox.querySelector('input').checked).toBe(false);
    expect(chkbox.textContent.trim()).toBe('Tab');
  });

  it('shows the tab with the display flag', () => {
    tabview('tabview');

    const { entry, location } = stubEntry({ target: 'tabview', display: true });

    location.style = { strokeColor: '#f00' };

    const chkbox = tab(entry);

    expect(entry.show).toHaveBeenCalledTimes(1);
    expect(chkbox.querySelector('input').checked).toBe(true);
  });

  it('shows and removes the tab with the checkbox', () => {
    tabview('tabview');

    const { entry, location } = stubEntry({ target: 'tabview' });

    location.style = { strokeColor: '#f00' };

    const input = append(tab(entry)).querySelector('input');

    input.click();

    expect(entry.display).toBe(true);
    expect(entry.show).toHaveBeenCalledTimes(1);

    input.click();

    expect(entry.display).toBe(false);
    expect(entry.remove).toHaveBeenCalledTimes(1);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3134: the tab method reads the strokeColor of the location style without a check, unlike the tab of a dataview entry which uses the primary colour.
  it.fails('uses the primary colour for a location without a style', () => {
    tabview('tabview');

    const { entry } = stubEntry({ target: 'tabview' });

    tab(entry);

    expect(entry.tab_style).toBe(
      'border-bottom: 3px solid var(--color-primary)',
    );
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3134: the tab method dispatches the addTab event without a check for the tabview element.
  it.fails('returns without a tabview element', () => {
    const { entry, location } = stubEntry({ target: 'no-such-tabview' });

    location.style = { strokeColor: '#f00' };

    expect(tab(entry)).toBeUndefined();
  });
});
