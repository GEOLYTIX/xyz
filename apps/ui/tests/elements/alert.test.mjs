import { afterEach, describe, expect, it } from 'vitest';

const { alert, confirm } = mapp.ui.elements;

/**
Resolves after the close event of a dialog element, which is dispatched as a task.
*/
function closed(node) {
  return new Promise((resolve) =>
    node.addEventListener('close', resolve, { once: true }),
  );
}

function buttons(params) {
  return [...params.node.querySelectorAll('.buttons button')];
}

afterEach(() => {
  for (const node of document.querySelectorAll('dialog')) node.remove();
});

describe('ui/elements/alert', () => {
  it('shows a modal dialog with the text and an OK button', () => {
    const params = alert({ text: 'Saved.' });

    expect(params.node.open).toBe(true);
    expect(params.node.dataset.id).toBe('alert');
    expect(params.node.classList).toContain('alert-confirm');
    expect(params.node.querySelector('header').textContent).toContain(
      mapp.dictionary.information,
    );
    expect(params.node.querySelector('header span').textContent).toBe('info');
    expect(params.node.querySelector('p').textContent).toBe('Saved.');
    expect(buttons(params).map((button) => button.textContent.trim())).toEqual([
      mapp.dictionary.ok,
    ]);
  });

  it('accepts a string like the window.alert()', () => {
    const params = alert('Saved.');

    expect(params.node.querySelector('p').textContent).toBe('Saved.');
  });

  it('removes the dialog with the OK button', async () => {
    const params = alert({ text: 'Saved.' });

    const close = closed(params.node);

    buttons(params)[0].click();

    await close;

    expect(params.node.isConnected).toBe(false);
  });

  it('has no icon with an empty icon param', () => {
    const params = alert({ text: 'Saved.', icon: '', title: 'Done' });

    expect(params.node.querySelector('header span')).toBeNull();
    expect(params.node.querySelector('header').textContent.trim()).toBe('Done');
  });

  it('renders the innerContent instead of the text', () => {
    const innerContent = mapp.utils.html.node`<ul class="list">`;

    const params = alert({ innerContent });

    expect(params.node.querySelector('.content ul.list')).toBe(innerContent);
  });
});

describe('ui/elements/confirm', () => {
  function confirmDialog() {
    return document.querySelector('dialog[data-id=confirm]');
  }

  it('resolves true with the OK button', async () => {
    const result = confirm({ text: 'Delete?' });

    const node = confirmDialog();

    expect(node.querySelector('p').textContent).toBe('Delete?');
    expect(node.querySelector('header').textContent).toContain(
      mapp.dictionary.confirm,
    );

    node.querySelectorAll('.buttons button')[0].click();

    await expect(result).resolves.toBe(true);
    expect(node.isConnected).toBe(false);
  });

  it('resolves false with the cancel button', async () => {
    const result = confirm('Delete?');

    const node = confirmDialog();

    expect(
      [...node.querySelectorAll('.buttons button')].map((button) =>
        button.textContent.trim(),
      ),
    ).toEqual([mapp.dictionary.ok, mapp.dictionary.cancel]);

    node.querySelectorAll('.buttons button')[1].click();

    await expect(result).resolves.toBe(false);
    expect(node.isConnected).toBe(false);
  });

  it('has no close and minimize buttons', () => {
    confirm({ text: 'Delete?', closeBtn: true, minimizeBtn: true });

    const node = confirmDialog();

    expect(node.querySelector('[data-id=close]')).toBeNull();
    expect(node.querySelector('[data-id=minimize]')).toBeNull();
  });
});
