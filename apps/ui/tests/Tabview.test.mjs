import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from 'vitest';

const { Tabview } = mapp.ui;

/**
@function createTabview

@description
Creates a tabview in a node which is appended to the document. The node is removed when the test finishes.

@param {Object} [params] Properties to assign to the tabview.
@returns {tabview} The decorated tabview.
*/
function createTabview(params = {}) {
  const node = document.createElement('div');

  document.body.append(node);

  onTestFinished(() => node.remove());

  return Tabview({ node, ...params });
}

/**
@function fakeLayer

@description
Returns a layer object with the callback arrays which are used by the tabview.

@returns {Object} The layer object.
*/
function fakeLayer() {
  return { hideCallbacks: [], removeCallbacks: [], showCallbacks: [] };
}

/**
@function mousedown

@description
Dispatches a mousedown event with a button on the header of a tab.

@param {Object} entry A tabview entry.
@param {number} button The MouseEvent button.
*/
function mousedown(entry, button) {
  entry.tab
    .querySelector('.header')
    .dispatchEvent(new MouseEvent('mousedown', { bubbles: true, button }));
}

/**
@function tabLabels

@description
Returns the labels of the tabs in the tabview.

@param {tabview} tabview The tabview.
@returns {Array<string>} The tab button labels.
*/
function tabLabels(tabview) {
  return [...tabview.tabs.querySelectorAll('.tab')].map(
    (tab) => tab.querySelector('.header > button').textContent,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('ui/Tabview', () => {
  it('returns without a node', () => {
    expect(Tabview({})).toBeUndefined();
  });

  it('creates the tabs and panel elements in the node', () => {
    const tabview = createTabview({ id: 'tabview' });

    expect(tabview.node.dataset.id).toBe('tabview');
    expect(tabview.tabs.className).toBe('tabs');
    expect(tabview.panel.className).toBe('panel');
    expect([...tabview.node.children]).toEqual([tabview.tabs, tabview.panel]);
  });

  it('adds a tab with the addTab event', () => {
    const tabview = createTabview();

    const entry = { label: 'Event' };

    tabview.node.dispatchEvent(new CustomEvent('addTab', { detail: entry }));

    entry.show();

    expect(tabLabels(tabview)).toEqual(['Event']);
  });

  it.each([
    ['title', { title: 'Title', key: 'key' }, 'Title'],
    ['key', { key: 'key' }, 'key'],
    ['default label', {}, 'Tab'],
  ])('labels a tab with the %s', (_, entry, label) => {
    const tabview = createTabview();

    tabview.addTab(entry);

    expect(entry.label).toBe(label);
    expect(entry.tab_btn.textContent).toBe(label);
  });

  it('shows a tab with its panel', () => {
    const showTab = vi.fn();

    const tabview = createTabview({ showTab });

    const entry = { label: 'A', class: 'custom' };

    tabview.addTab(entry);

    // The tab is added to the tabview when shown.
    expect(entry.tab.parentElement).toBeNull();

    entry.show();

    expect(entry.tab.parentElement).toBe(tabview.tabs);
    expect(entry.tab.classList).toContain('active');
    expect(entry.panel.className).toBe('panel custom');
    expect(tabview.panel.firstElementChild).toBe(entry.panel);
    expect(showTab).toHaveBeenCalledTimes(1);
  });

  it('shows the entry target as panel', () => {
    const tabview = createTabview();

    const target = document.createElement('div');

    const entry = { label: 'A', target };

    tabview.addTab(entry);

    entry.show();

    expect(entry.panel).toBe(target);
    expect(tabview.panel.firstElementChild).toBe(target);
  });

  it('doesn’t add an entry with a tab again', () => {
    const tabview = createTabview();

    const entry = { label: 'A' };

    tabview.addTab(entry);

    const { tab } = entry;

    tabview.addTab(entry);

    expect(entry.tab).toBe(tab);
  });

  it('activates the tab which is shown last after 500ms', () => {
    const tabview = createTabview();

    const a = { activate: vi.fn(), label: 'A' };
    const b = { activate: vi.fn(), label: 'B' };

    tabview.addTab(a);
    tabview.addTab(b);

    a.show();
    b.show();

    expect(tabLabels(tabview)).toEqual(['A', 'B']);
    expect(a.tab.classList).not.toContain('active');
    expect(b.tab.classList).toContain('active');

    vi.advanceTimersByTime(499);

    expect(b.activate).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(a.activate).not.toHaveBeenCalled();
    expect(b.activate).toHaveBeenCalledTimes(1);
  });

  it('shows a tab with a click on the tab header', () => {
    const tabview = createTabview();

    const a = { label: 'A' };
    const b = { label: 'B' };

    tabview.addTab(a);
    tabview.addTab(b);

    a.show();
    b.show();

    a.tab.querySelector('.header').click();

    expect(a.tab.classList).toContain('active');
    expect(b.tab.classList).not.toContain('active');
    expect(tabview.panel.firstElementChild).toBe(a.panel);
  });

  it('disables a tab', () => {
    const tabview = createTabview();

    const entry = { disabled: true, label: 'A', tab_style: 'color: red' };

    tabview.addTab(entry);

    const header = entry.tab.querySelector('.header');

    expect(entry.tab.style.opacity).toBe('0.3');
    expect(header.inert).toBe(true);
    expect(header.style.color).toBe('red');
  });

  describe('activate', () => {
    it('creates and updates a dataview tab', () => {
      const create = vi.fn();

      mapp.ui.utils.fake = { create };

      onTestFinished(() => delete mapp.ui.utils.fake);

      const tabview = createTabview();

      const btnRow = document.createElement('div');

      const entry = { btnRow, dataview: 'fake', label: 'A', update: vi.fn() };

      tabview.addTab(entry);

      entry.show();

      vi.advanceTimersByTime(500);

      expect(create).toHaveBeenCalledWith(entry);
      expect(entry.update).toHaveBeenCalledTimes(1);
      expect(btnRow.style.display).toBe('flex');

      // The dataview is not created again and the data is not updated.
      entry.data = [];

      entry.show();

      vi.advanceTimersByTime(500);

      expect(create).toHaveBeenCalledTimes(1);
      expect(entry.update).toHaveBeenCalledTimes(1);
    });

    it('creates and updates a dynamic dataview tab each time', () => {
      const tabview = createTabview();

      const entry = {
        create: vi.fn(),
        data: [],
        dynamic: true,
        label: 'A',
        update: vi.fn(),
      };

      tabview.addTab(entry);

      entry.show();

      vi.advanceTimersByTime(500);

      entry.show();

      vi.advanceTimersByTime(500);

      expect(entry.create).toHaveBeenCalledTimes(2);
      expect(entry.update).toHaveBeenCalledTimes(2);
    });

    it('doesn’t throw for a tab without dataview type', () => {
      const tabview = createTabview();

      const entry = { label: 'A' };

      tabview.addTab(entry);

      entry.show();

      expect(() => vi.advanceTimersByTime(500)).not.toThrow();
    });
  });

  describe('remove', () => {
    it('removes a tab with the close button and activates the sibling', () => {
      const tabview = createTabview();

      const a = { label: 'A' };
      const b = { label: 'B', display: true };

      tabview.addTab(a);
      tabview.addTab(b);

      a.show();
      b.show();

      b.tab.querySelector('.close_tab').click();

      expect(b.display).toBe(false);
      expect(tabLabels(tabview)).toEqual(['A']);
      expect(a.tab.classList).toContain('active');
      expect(tabview.panel.firstElementChild).toBe(a.panel);
    });

    it('doesn’t activate a sibling if a tab which is not active is removed', () => {
      const tabview = createTabview();

      const a = { label: 'A' };
      const b = { label: 'B' };
      const c = { label: 'C', activate: vi.fn() };

      for (const entry of [a, b, c]) {
        tabview.addTab(entry);
        entry.show();
      }

      a.remove();

      expect(tabLabels(tabview)).toEqual(['B', 'C']);
      expect(b.tab.classList).not.toContain('active');
      expect(c.tab.classList).toContain('active');
    });

    it('unchecks the chkbox of a removed tab', () => {
      const tabview = createTabview();

      const chkbox = mapp.ui.elements.chkbox({ checked: true, label: 'A' });

      const entry = { chkbox, label: 'A' };

      tabview.addTab(entry);

      entry.show();

      entry.hide();

      expect(chkbox.querySelector('input').checked).toBe(false);
    });

    it('calls the removeLastTab method for the last tab', () => {
      const removeLastTab = vi.fn();

      const tabview = createTabview({ removeLastTab });

      const entry = { label: 'A' };

      tabview.addTab(entry);

      // A tab which is not in the tabview can't be removed.
      entry.remove();

      expect(removeLastTab).not.toHaveBeenCalled();

      entry.show();

      entry.remove();

      expect(removeLastTab).toHaveBeenCalledTimes(1);
      expect(tabview.tabs.children).toHaveLength(0);
    });

    it('removes a tab with a middle click', () => {
      const tabview = createTabview();

      const entry = { label: 'A' };

      tabview.addTab(entry);

      entry.show();

      // The primary button doesn't remove the tab.
      mousedown(entry, 0);

      expect(entry.tab.parentElement).toBe(tabview.tabs);

      mousedown(entry, 1);

      expect(entry.tab.parentElement).toBeNull();
    });

    it('doesn’t remove a tab with disableTabClose', () => {
      const tabview = createTabview();

      const entry = { disableTabClose: true, label: 'A' };

      tabview.addTab(entry);

      entry.show();

      expect(entry.tab.querySelector('.close_tab')).toBeNull();

      mousedown(entry, 1);

      expect(entry.tab.parentElement).toBe(tabview.tabs);
    });

    it('hides the close button with hideTabClose', () => {
      const tabview = createTabview();

      const entry = { hideTabClose: true, label: 'A' };

      tabview.addTab(entry);

      entry.show();

      expect(entry.tab.querySelector('.close_tab')).toBeNull();

      // The tab can be removed with a middle click.
      mousedown(entry, 1);

      expect(entry.tab.parentElement).toBeNull();
    });

    it('assigns disableTabClose from the hide flag of the layer dataviews', () => {
      const tabview = createTabview();

      const layer = { ...fakeLayer(), dataviews: { hide: true, dv: {} } };

      const entry = { key: 'dv', layer };

      tabview.addTab(entry);

      expect(entry.disableTabClose).toBe(true);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3123: the mousedown handler of the tab header removes the tab for `e.which === 2 || e.button === 4`. The MouseEvent button 4 is the fifth button, which is the browser Forward button on most mice. The middle button is `e.button === 1`, which is `e.which === 2`.
    it.fails('doesn’t remove a tab with the forward button', () => {
      const tabview = createTabview();

      const entry = { label: 'A' };

      tabview.addTab(entry);

      entry.show();

      mousedown(entry, 4);

      expect(entry.tab.parentElement).toBe(tabview.tabs);
    });
  });

  describe('layer and location', () => {
    it('shows and hides a tab with its layer', () => {
      const tabview = createTabview();

      const layer = fakeLayer();

      const entry = { label: 'A', layer };

      tabview.addTab(entry);

      // A tab without display flag is not shown with the layer.
      layer.showCallbacks.forEach((fn) => fn());

      expect(entry.tab.parentElement).toBeNull();

      entry.display = true;

      layer.showCallbacks.forEach((fn) => fn());

      expect(entry.tab.parentElement).toBe(tabview.tabs);

      layer.hideCallbacks.forEach((fn) => fn());

      expect(entry.tab.parentElement).toBeNull();

      // The display flag is kept to show the tab with the layer again.
      expect(entry.display).toBe(true);
    });

    it('removes a tab with its location', () => {
      const tabview = createTabview();

      const location = { removeCallbacks: [] };

      // The layer callbacks are not assigned for a location tab.
      const layer = fakeLayer();

      const entry = { label: 'A', layer, location };

      tabview.addTab(entry);

      entry.show();

      expect(layer.showCallbacks).toHaveLength(0);

      location.removeCallbacks.forEach((fn) => fn());

      expect(entry.tab.parentElement).toBeNull();
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3123: the addTab method returns early only for an entry with a tab which is not dynamic. A dynamic entry is decorated again each time it is added, and pushes another set of show and hide callbacks to its layer, or another remove callback to its location.
    it.fails('doesn’t add the layer callbacks of a dynamic tab again', () => {
      const tabview = createTabview();

      const layer = fakeLayer();

      const entry = { dynamic: true, label: 'A', layer };

      tabview.addTab(entry);
      tabview.addTab(entry);

      expect(layer.showCallbacks).toHaveLength(1);
      expect(layer.hideCallbacks).toHaveLength(1);
    });
  });
});
