import { describe, expect, it, onTestFinished, vi } from 'vitest';

const { control } = mapp.ui.elements;

/**
Returns a control for a target element in the document. The target is removed when the test finishes.
*/
function createControl() {
  const target = document.createElement('div');

  document.body.append(target);

  onTestFinished(() => target.remove());

  return control({ target });
}

describe('ui/elements/control', () => {
  it('returns undefined without a target', () => {
    expect(control({})).toBeUndefined();
  });

  it('decorates the target with tabs and panels', () => {
    const ctrl = createControl();

    expect(ctrl.target.classList).toContain('mapp-control');
    expect(ctrl.tabs.matches('nav.tabs.hover')).toBe(true);
    expect(ctrl.panels.matches('div.panels')).toBe(true);
    expect([...ctrl.target.children]).toEqual([ctrl.tabs, ctrl.panels]);
    expect(ctrl.add).toBeTypeOf('function');
  });

  it('adds a tab and a panel', () => {
    const ctrl = createControl();

    const panel = document.createElement('div');

    ctrl.add({ key: 'layers', panel });

    const tab = ctrl.tabs.firstElementChild;

    expect(tab.dataset.id).toBe('layers');
    expect(tab.title).toBe(mapp.dictionary.layers || 'layers');
    expect(tab.textContent.trim()).toBe('layers');
    expect(tab.classList).toContain('material-symbols-outlined');
    expect(tab.classList).toContain('active');
    expect(ctrl.panels.firstElementChild).toBe(panel);
  });

  it('assigns the icon, title and classList params', () => {
    const ctrl = createControl();

    ctrl.add({ key: 'first' });

    ctrl.add({
      key: 'custom',
      icon: 'star',
      title: 'Custom',
      classList: 'custom-tab',
    });

    const tab = ctrl.tabs.querySelector('[data-id=custom]');

    expect(tab.title).toBe('Custom');
    expect(tab.textContent.trim()).toBe('star');
    expect(tab.className).toBe('custom-tab');

    // A panel element is created without a panel param.
    expect(ctrl.panels.children).toHaveLength(2);
  });

  it('shows the panel of a tab with a click', () => {
    const ctrl = createControl();

    ctrl.add({ key: 'layers' });
    ctrl.add({ key: 'locations' });

    const [layersTab, locationsTab] = ctrl.tabs.children;
    const [layersPanel, locationsPanel] = ctrl.panels.children;

    locationsTab.click();

    expect(locationsTab.classList).toContain('active');
    expect(layersTab.classList).not.toContain('active');
    expect(locationsPanel.checkVisibility()).toBe(true);
    expect(layersPanel.checkVisibility()).toBe(false);

    layersTab.click();

    expect(layersTab.classList).toContain('active');
    expect(locationsTab.classList).not.toContain('active');
    expect(layersPanel.checkVisibility()).toBe(true);
    expect(locationsPanel.checkVisibility()).toBe(false);
  });

  it('focuses the focus element of a tab', () => {
    const ctrl = createControl();

    const input = document.createElement('input');
    input.name = 'control-search';

    const panel = document.createElement('div');
    panel.append(input);

    ctrl.add({ key: 'first' });
    ctrl.add({ key: 'search', panel, focus: 'control-search' });

    ctrl.tabs.querySelector('[data-id=search]').click();

    expect(document.activeElement).toBe(input);

    input.blur();

    // The focus element is assigned as element with the first click.
    ctrl.tabs.querySelector('[data-id=first]').click();
    ctrl.tabs.querySelector('[data-id=search]').click();

    expect(document.activeElement).toBe(input);
  });

  it('calls a custom onClick method', () => {
    const ctrl = createControl();

    const onClick = vi.fn();

    ctrl.add({ key: 'custom', onClick });

    const tab = ctrl.tabs.firstElementChild;

    tab.click();

    expect(onClick).toHaveBeenCalledOnce();

    const [e, params] = onClick.mock.calls[0];

    expect(e.type).toBe('click');
    expect(params.tab).toBe(tab);
    expect(params.parent).toBe(ctrl);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3140: the first tab gets the active class, but its panel doesn't. The css only shows an active panel, so no panel is shown until a tab is clicked.
  it.fails('shows the panel of the first tab', () => {
    const ctrl = createControl();

    ctrl.add({ key: 'layers' });
    ctrl.add({ key: 'locations' });

    expect(ctrl.panels.firstElementChild.checkVisibility()).toBe(true);
  });
});
