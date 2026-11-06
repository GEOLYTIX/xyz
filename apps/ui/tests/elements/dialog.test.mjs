import { afterEach, describe, expect, it, vi } from 'vitest';

const { dialog } = mapp.ui.elements;

/**
Creates a sized target element for non-modal dialogs. The target is removed after the test.
*/
function createTarget() {
  const target = document.createElement('div');

  target.style.cssText = 'position:relative;width:600px;height:400px;';

  document.body.append(target);

  return target;
}

/**
Resolves after the close event of a dialog element, which is dispatched as a task.
*/
function closed(node) {
  return new Promise((resolve) =>
    node.addEventListener('close', resolve, { once: true }),
  );
}

afterEach(() => {
  for (const node of document.querySelectorAll('dialog')) node.remove();
  document.body.replaceChildren();
});

describe('ui/elements/dialog', () => {
  it('shows a modal dialog in the document body without a target', () => {
    const params = dialog({ header: 'Title', content: 'Content' });

    expect(params.modal).toBe(true);
    expect(params.node.parentElement).toBe(document.body);
    expect(params.node.open).toBe(true);
    expect(params.node.dataset.id).toBe('dialog');
    expect(params.node.className).toBe('box-shadow modal');
    expect(params.node.querySelector('header h2').textContent).toBe('Title');
    expect(params.node.querySelector('.content').textContent).toBe('Content');
  });

  it('closes the current modal dialog for a new modal dialog', async () => {
    const first = dialog({ header: 'First' });

    const firstClosed = closed(first.node);

    const second = dialog({ header: 'Second' });

    await firstClosed;

    expect(first.node.isConnected).toBe(false);
    expect(second.node.open).toBe(true);
  });

  it('removes the dialog and calls onClose with the close button', () => {
    const onClose = vi.fn();

    const params = dialog({ header: 'Title', closeBtn: true, onClose });

    params.node.querySelector('[data-id=close]').click();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(params.node.isConnected).toBe(false);
  });

  it('toggles the minimized class with the minimize button', () => {
    const params = dialog({ header: 'Title', minimizeBtn: true });

    const button = params.node.querySelector('[data-id=minimize]');

    button.click();

    expect(params.node.classList).toContain('minimized');

    button.click();

    expect(params.node.classList).not.toContain('minimized');
  });

  it('uses a header element', () => {
    const header = mapp.utils.html.node`<div class="custom-header">Custom`;

    const params = dialog({ header });

    expect(params.node.querySelector('header .custom-header')).toBe(header);
  });

  it('shows a dialog in the target at the top and left position', () => {
    const target = createTarget();

    const params = dialog({
      target,
      header: 'Title',
      top: '20px',
      left: '30px',
      data_id: 'my-dialog',
    });

    expect(params.modal).toBeUndefined();
    expect(params.node.parentElement).toBe(target);
    expect(params.node.open).toBe(true);
    expect(params.node.className).toBe('box-shadow dialog');
    expect(params.node.dataset.id).toBe('my-dialog');
    expect(params.node.style.top).toBe('20px');
    expect(params.node.style.left).toBe('30px');
  });

  it('positions the dialog from the right of the target', () => {
    const target = createTarget();

    const params = dialog({
      target,
      header: 'Title',
      css_style: 'width:100px;',
      right: '50',
    });

    expect(params.left).toBe(600 - params.node.offsetWidth - 50);
  });

  it('shows a dialog again after it has been closed', () => {
    const target = createTarget();

    const params = dialog({ target, header: 'Title', closeBtn: true });

    params.close();

    expect(params.node.isConnected).toBe(false);

    // The dialog method shows an existing dialog.
    expect(dialog(params)).toBeUndefined();

    expect(params.node.parentElement).toBe(target);
  });

  it('returns undefined for a target which is not an element', () => {
    expect(dialog({ target: 'map', header: 'Title' })).toBeUndefined();
  });

  it('moves the dialog by dragging', () => {
    const target = createTarget();

    const params = dialog({ target, header: 'Title', top: '0px', left: '0px' });

    params.node.dispatchEvent(
      new MouseEvent('mousedown', { bubbles: true, clientX: 10, clientY: 10 }),
    );

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 10, clientY: 10 }),
    );
    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 60, clientY: 40 }),
    );

    expect(params.node.style.left).toBe('50px');
    expect(params.node.style.top).toBe('30px');

    window.dispatchEvent(new MouseEvent('mouseup'));

    // The dialog doesn't move after the drag.
    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 100, clientY: 100 }),
    );

    expect(params.node.style.left).toBe('50px');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3036: the drag end listener is added to the window, but the stopShift method removes it from the dialog target. The window keeps a listener for every drag.
  it.fails('removes the drag end listener from the window', () => {
    const target = createTarget();

    const params = dialog({ target, header: 'Title' });

    const removeEventListener = vi.spyOn(window, 'removeEventListener');

    params.node.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    window.dispatchEvent(new MouseEvent('mouseup'));

    expect(removeEventListener).toHaveBeenCalledWith(
      'mouseup',
      expect.any(Function),
    );

    removeEventListener.mockRestore();
  });

  it('doesn’t drag a headerDrag dialog outside the header', () => {
    const target = createTarget();

    const params = dialog({
      target,
      header: 'Title',
      content: mapp.utils.html.node`<p class="body">Body`,
      headerDrag: true,
      top: '0px',
      left: '0px',
    });

    params.node
      .querySelector('.body')
      .dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));

    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 10, clientY: 10 }),
    );
    target.dispatchEvent(
      new MouseEvent('mousemove', { clientX: 60, clientY: 60 }),
    );

    expect(params.node.style.left).toBe('0px');
  });
});
