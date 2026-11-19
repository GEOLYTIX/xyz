import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { mapTarget } from './_helpers.mjs';

const { drawer } = mapp.ui.elements;

/**
Returns a layer stub with show and hide callbacks.
*/
function layerStub(display = true) {
  const layer = {
    display,
    showCallbacks: [],
    hideCallbacks: [],
    show: vi.fn(() => {
      layer.display = true;
      for (const fn of layer.showCallbacks) fn(layer);
    }),
    hide: () => {
      layer.display = false;
      for (const fn of layer.hideCallbacks) fn(layer);
    },
  };

  return layer;
}

/**
Appends an element to the document. The element is removed when the test finishes.
*/
function append(el) {
  document.body.append(el);

  onTestFinished(() => el.remove());

  return el;
}

/**
Creates an expanded layer view drawer with the drawer node as content, like the layer.view of the default view. The layer view is appended to the document.
*/
function layerView(content) {
  const view = append(
    drawer({ data_id: 'layer', header: mapp.utils.html`<h2>Layer`, content }),
  );

  view.classList.add('expanded');

  return view;
}

describe('ui/elements/drawer', () => {
  it('creates an expandable drawer with a header, caret and content', () => {
    const node = drawer({
      data_id: 'test-drawer',
      class: 'custom',
      header: mapp.utils.html`<h3>Header`,
      content: mapp.utils.html`<p>Content`,
    });

    expect(node.dataset.id).toBe('test-drawer');
    expect(node.classList).toContain('drawer');
    expect(node.classList).toContain('expandable');
    expect(node.classList).toContain('custom');
    expect(node.querySelector('.header h3').textContent).toBe('Header');
    expect(node.querySelector('.header .caret')).not.toBeNull();
    expect(node.querySelector('.content p').textContent).toBe('Content');

    // The header click toggles the expanded class.
    node.querySelector('.header').click();

    expect(node.classList).toContain('expanded');

    node.querySelector('.header').click();

    expect(node.classList).not.toContain('expanded');
  });

  it('assigns the default data-id', () => {
    expect(drawer({}).dataset.id).toBe('drawer');
  });

  it('doesn’t add a caret to a header with a caret', () => {
    const node = drawer({
      header: mapp.utils.html`<h3>Header</h3><div class="caret">`,
    });

    expect(node.querySelectorAll('.caret')).toHaveLength(1);
  });

  it('doesn’t expand an empty drawer', () => {
    const node = drawer({ class: 'empty', header: mapp.utils.html`<h3>Empty` });

    node.querySelector('.header').click();

    expect(node.classList).not.toContain('expanded');
  });

  it('creates a card with a header for drawer false', () => {
    const node = drawer({
      drawer: false,
      data_id: 'card',
      header: mapp.utils.html`<h3>Header`,
      content: mapp.utils.html`<p>Content`,
    });

    expect(node.className.trim()).toBe('drawer');
    expect(node.querySelector('.header h3').textContent).toBe('Header');
    expect(node.querySelector('.caret')).toBeNull();
  });

  it('creates the content only for drawer null', () => {
    const node = drawer({
      drawer: null,
      data_id: 'content-only',
      header: mapp.utils.html`<h3>Header`,
      content: mapp.utils.html`<p>Content`,
    });

    expect(node.dataset.id).toBe('content-only');
    expect(node.querySelector('.header')).toBeNull();
    expect(node.querySelector('.content p').textContent).toBe('Content');
  });

  it('disables the drawer with the layer display', () => {
    const layer = layerStub(false);

    const node = drawer({ drawer: 'disableOnHide', layer });

    expect(node.classList).toContain('disable-on-hide');
    expect(node.classList).toContain('disabled');

    layer.show();

    expect(node.classList).not.toContain('disabled');

    node.classList.add('expanded');

    layer.hide();

    expect(node.classList).toContain('disabled');
    expect(node.classList).not.toContain('expanded');
  });

  describe('popout', () => {
    it('pops the drawer out into a dialog and back', () => {
      const target = mapTarget();

      const params = {
        data_id: 'pop',
        header: mapp.utils.html`<h3>Pop`,
        content: mapp.utils.html`<p>Popped content`,
        popout: true,
      };

      const node = drawer(params);

      // A sibling keeps the layer view open.
      const view = layerView([node, mapp.utils.html.node`<div>Sibling`]);

      const btn = node.querySelector('[data-id=popout-btn]');

      // The popout button is inserted before the caret.
      expect(btn.nextElementSibling.classList).toContain('caret');

      btn.click();

      const dialog = target.querySelector('dialog[data-id=pop-popout]');

      expect(node.style.display).toBe('none');
      expect(dialog.querySelector('.content p').textContent).toBe(
        'Popped content',
      );
      expect(dialog.querySelector('header h3').textContent).toBe('Pop');
      expect(dialog.querySelector('header [data-id=close]')).not.toBeNull();
      expect(dialog.querySelector('header [data-id=minimize]')).not.toBeNull();
      expect(params.popout.view).toBe(dialog.querySelector('.content'));

      // The layer view stays open with the sibling.
      expect(view.classList).not.toContain('empty');

      dialog.querySelector('[data-id=close]').click();

      expect(dialog.isConnected).toBe(false);
      expect(node.style.display).toBe('');
      expect(node.querySelector('.content p').textContent).toBe(
        'Popped content',
      );
      expect(node.querySelector('.header h3').textContent).toBe('Pop');

      // The close and minimize buttons are not moved into the drawer header.
      expect(node.querySelector('[data-id=close]')).toBeNull();
      expect(node.querySelector('[data-id=popout-btn]')).toBe(btn);

      // The dialog is shown again with the next click.
      btn.click();

      expect(dialog.isConnected).toBe(true);
      expect(dialog.querySelector('.content p').textContent).toBe(
        'Popped content',
      );
      expect(dialog.querySelector('header [data-id=close]')).not.toBeNull();
    });

    it('closes an empty layer view with the popout', () => {
      mapTarget();

      const node = drawer({
        data_id: 'pop',
        header: mapp.utils.html`<h3>Pop`,
        content: mapp.utils.html`<p>Popped content`,
        popout: true,
      });

      const view = layerView(node);

      const caret = view.querySelector(':scope > .header .caret');

      node.querySelector('[data-id=popout-btn]').click();

      // The click on the layer view header collapses the layer view.
      expect(view.classList).toContain('empty');
      expect(view.classList).not.toContain('expanded');
      expect(caret.style.display).toBe('none');

      document.querySelector('dialog [data-id=close]').click();

      expect(view.classList).not.toContain('empty');
      expect(view.classList).toContain('expanded');
      expect(caret.style.display).toBe('');
    });

    it('uses a popout button from the header', () => {
      mapTarget();

      const node = drawer({
        header: mapp.utils.html`<h3>Pop</h3><button data-id="popout-btn">`,
        popout: true,
      });

      layerView(node);

      expect(node.querySelectorAll('[data-id=popout-btn]')).toHaveLength(1);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3142: the colon is missing in the 'height 300px' declaration of the popout css_style. The declaration is invalid and the height is not assigned.
    it.fails('shows the popout with a height of 300px', () => {
      const target = mapTarget();

      const node = drawer({
        data_id: 'pop',
        header: mapp.utils.html`<h3>Pop`,
        popout: true,
      });

      layerView(node);

      node.querySelector('[data-id=popout-btn]').click();

      expect(target.querySelector('dialog').style.height).toBe('300px');
    });
  });

  describe('dialog', () => {
    it('creates a button to toggle a dialog with the content', () => {
      const target = mapTarget();

      const layer = layerStub();

      const params = {
        data_id: 'dlg',
        dialog: true,
        content: mapp.utils.html`<p>Dialog content`,
        layer,
      };

      const btn = drawer(params);

      expect(btn.tagName).toBe('BUTTON');
      expect(btn.dataset.id).toBe('dlg');
      expect(btn.title).toBe('Open dialog');
      expect(btn.textContent).toContain('Open dialog');

      btn.click();

      const dialog = target.querySelector('dialog[data-id=dlg-dialog]');

      expect(btn.classList).toContain('active');
      expect(layer.show).toHaveBeenCalled();
      expect(dialog.querySelector('header h1').textContent).toBe('Dialog');
      expect(dialog.querySelector('.content p').textContent).toBe(
        'Dialog content',
      );

      btn.click();

      expect(btn.classList).not.toContain('active');
      expect(dialog.isConnected).toBe(false);

      // The dialog is shown again.
      btn.click();

      expect(dialog.isConnected).toBe(true);
      expect(target.querySelectorAll('dialog')).toHaveLength(1);

      // The close button removes the active class from the button.
      dialog.querySelector('[data-id=close]').click();

      expect(btn.classList).not.toContain('active');
    });

    it('assigns the dialog config', () => {
      const target = mapTarget();

      const btn = drawer({
        dialog: {
          btn_label: 'Show table',
          btn_title: 'Table dialog',
          icon: 'table_view',
          title: 'Table',
        },
      });

      expect(btn.title).toBe('Table dialog');
      expect(btn.querySelector('span').textContent).toBe('table_view');
      expect(btn.textContent).toContain('Show table');

      btn.click();

      expect(target.querySelector('dialog header h1').textContent).toBe(
        'Table',
      );
    });

    it('closes the dialog with the layer and shows it with showOnLayerDisplay', () => {
      const target = mapTarget();

      const layer = layerStub();

      const btn = drawer({
        data_id: 'dlg',
        dialog: { showOnLayerDisplay: true },
        layer,
      });

      btn.click();

      const dialog = target.querySelector('dialog');

      layer.hide();

      expect(dialog.isConnected).toBe(false);
      expect(btn.classList).not.toContain('active');

      layer.show();

      expect(dialog.isConnected).toBe(true);
    });

    it('doesn’t close a dialog which has not been opened with the layer', () => {
      const layer = layerStub();

      drawer({ dialog: true, layer });

      expect(() => layer.hide()).not.toThrow();
    });
  });
});
