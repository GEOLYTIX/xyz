import { describe, expect, it, vi } from 'vitest';
import { append, fakeType, stubEntry } from './_helpers.mjs';

const { dataview } = mapp.ui.locations.entries;

/**
Creates a fake dataview entry with a stub location.
*/
function dataviewEntry(params) {
  fakeType();

  return stubEntry({
    type: 'dataview',
    dataview: 'fake',
    key: 'fake',
    ...params,
  });
}

describe('ui/locations/entries/dataview', () => {
  it('renders the dataview into a location view target', () => {
    const { entry, location } = dataviewEntry({ label: 'Chart' });

    const node = dataview(entry);

    expect(entry.layer).toBe(location.layer);
    expect(entry.locationViewTarget.className).toBe('location fake');
    expect(entry.target).toBe(entry.locationViewTarget);
    expect(node.contains(entry.chkbox)).toBe(true);
    expect(node.contains(entry.locationViewTarget)).toBe(true);
    expect(entry.chkbox.querySelector('input').checked).toBe(false);

    // The dataview is created when shown.
    expect(mapp.ui.utils.fake.create).not.toHaveBeenCalled();
  });

  it('uses the query as target class without a key', () => {
    const { entry } = dataviewEntry({ key: undefined, query: 'q' });

    dataview(entry);

    expect(entry.locationViewTarget.className).toBe('location q');
  });

  it('assigns the value as data', () => {
    const { entry } = dataviewEntry({ value: [1, 2], data: [3] });

    dataview(entry);

    expect(entry.data).toEqual([1, 2]);
  });

  it('assigns null for an empty data array', () => {
    const { entry } = dataviewEntry({ value: [] });

    dataview(entry);

    expect(entry.data).toBeNull();
  });

  it('creates and shows the dataview with the display flag', () => {
    const { entry } = dataviewEntry({ display: true, data: [1] });

    dataview(entry);

    expect(mapp.ui.utils.fake.create).toHaveBeenCalledWith(entry);
    expect(entry.target.style.display).toBe('block');
  });

  it('shows and hides the dataview with the checkbox', () => {
    const { entry } = dataviewEntry({ label: 'Chart' });

    // The dataview entry returns a fragment with the checkbox and the target.
    append(document.createElement('div')).append(dataview(entry));

    const input = entry.chkbox.querySelector('input');

    input.click();

    expect(entry.display).toBe(true);
    expect(mapp.ui.utils.fake.create).toHaveBeenCalledTimes(1);

    input.click();

    expect(entry.display).toBe(false);
    expect(entry.target.style.display).toBe('none');
  });

  it('returns the elements of a decorated dataview which is not displayed', () => {
    const { entry } = dataviewEntry({ label: 'Chart', display: true });

    dataview(entry);

    entry.hide();

    const node = dataview(entry);

    expect(node.contains(entry.chkbox)).toBe(true);
    expect(node.contains(entry.locationViewTarget)).toBe(true);
  });

  it('hides and disables the dataview without data for the queryCheck', () => {
    const { entry } = dataviewEntry({
      label: 'Chart',
      display: true,
      queryCheck: true,
      value: null,
    });

    dataview(entry);

    expect(entry.display).toBe(false);
    expect(entry.chkbox.classList).toContain('disabled');
    expect(entry.chkbox.querySelector('input').checked).toBe(false);
    expect(entry.target.style.display).toBe('none');
    expect(mapp.ui.utils.fake.create).not.toHaveBeenCalled();
  });

  it('displays the dataview in an element with the target id', () => {
    const target = append(document.createElement('div'));

    target.id = 'dataview-entry-target';

    const { entry } = dataviewEntry({ target: target.id });

    expect(dataview(entry).textContent.trim()).toBe('');

    expect(entry.target).toBe(target);
    expect(entry.display).toBe(true);
    expect(entry.locationViewTarget).toBeUndefined();
    expect(mapp.ui.utils.fake.create).toHaveBeenCalledWith(entry);
  });

  it('adds the dataview as tab to a tabview', () => {
    const tabview = append(document.createElement('div'));

    tabview.dataset.id = 'dataview-entry-tabview';

    const addTab = vi.fn();

    tabview.addEventListener('addTab', (e) => addTab(e.detail));

    const { entry, location } = dataviewEntry({
      target: 'dataview-entry-tabview',
    });

    dataview(entry);

    expect(addTab).toHaveBeenCalledWith(entry);
    expect(entry.tabview).toBe(tabview);
    expect(entry.target.classList).toContain('dataview-target');
    expect(entry.tab_style).toBe(
      'border-bottom: 3px solid var(--color-primary)',
    );

    // The tab border has the stroke colour of the location style.
    const styled = dataviewEntry({ target: 'dataview-entry-tabview' });

    styled.location.style = { strokeColor: '#f00' };

    dataview(styled.entry);

    expect(styled.entry.tab_style).toBe('border-bottom: 3px solid #f00');
    expect(location.style).toBeUndefined();
  });

  it('does not add a tab on mobile', () => {
    vi.spyOn(mapp.utils, 'mobile').mockReturnValue(true);

    const tabview = append(document.createElement('div'));

    tabview.dataset.id = 'dataview-entry-tabview';

    const { entry } = dataviewEntry({ target: 'dataview-entry-tabview' });

    expect(dataview(entry)).toBeUndefined();
    expect(entry.tabview).toBeUndefined();
  });

  it('shows the dataview in a dialog for the dialog target', () => {
    const dataviewDialog = vi
      .spyOn(mapp.ui.utils, 'dataviewDialog')
      .mockImplementation((entry) => {
        entry.target = document.createElement('div');
      });

    const { entry } = dataviewEntry({ target: 'dialog' });

    dataview(entry);

    expect(dataviewDialog).toHaveBeenCalledWith(entry);
    expect(entry.locationViewTarget).toBeUndefined();
  });

  it('returns without a target element', () => {
    const { entry } = dataviewEntry({ target: {} });

    expect(dataview(entry)).toBeUndefined();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3120: the Dataview decorator returns a Promise, so the instanceof Error check doesn't catch a dataview type which can't be decorated.
  it.fails('returns for a dataview type which can not be decorated', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { entry } = stubEntry({ type: 'dataview', dataview: 'unknown' });

    expect(dataview(entry)).toBeUndefined();
  });
});
