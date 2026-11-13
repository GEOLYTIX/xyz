import { afterEach, describe, expect, it, vi } from 'vitest';

const { toast } = mapp.ui.elements;

function toastNode() {
  return document.querySelector('.toast');
}

function actions() {
  return [...toastNode().querySelectorAll('.actions button')];
}

afterEach(() => {
  vi.useRealTimers();
  for (const node of document.querySelectorAll('.toast')) node.remove();
});

describe('ui/elements/toast', () => {
  it('shows the content and hides after the timeout without actions', async () => {
    vi.useFakeTimers();

    const result = toast({ content: 'Saved.' });

    expect(toastNode().dataset.id).toBe('ui-elements-toast');
    expect(toastNode().textContent).toContain('Saved.');

    vi.advanceTimersByTime(3000);

    expect(toastNode().classList).toContain('ease-out');

    await expect(result).resolves.toBeUndefined();

    // The toast is removed after the ease-out animation.
    vi.advanceTimersByTime(1200);

    expect(toastNode()).toBeNull();
  });

  it('hides after the timeout param', () => {
    vi.useFakeTimers();

    toast({ content: 'Saved.', timeout: 500 });

    vi.advanceTimersByTime(499);

    expect(toastNode().classList).not.toContain('ease-out');

    vi.advanceTimersByTime(1);

    expect(toastNode().classList).toContain('ease-out');
  });

  it('resolves with the value of the clicked action', async () => {
    const callback = vi.fn();

    const result = toast({
      content: 'Unsaved changes.',
      actions: [
        { label: 'Save', value: 'save', callback },
        { label: 'Discard' },
      ],
    });

    expect(actions().map((button) => button.className)).toEqual([
      'bold raised primary',
      'bold raised primary',
    ]);

    actions()[0].click();

    await expect(result).resolves.toBe('save');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses the label as value of an action', async () => {
    const result = toast({ actions: [{ label: 'Discard' }] });

    actions()[0].click();

    await expect(result).resolves.toBe('Discard');
  });

  it('adds accept and cancel actions', () => {
    toast({ accept: 'Yes', cancel: 'No' });

    expect(actions().map((button) => button.textContent)).toEqual([
      'Yes',
      'No',
    ]);
  });

  it('adds default accept and cancel labels', () => {
    toast({ accept: true, cancel: true });

    expect(actions().map((button) => button.textContent)).toEqual([
      'Accept',
      'Cancel',
    ]);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3035: the cancel label checks typeof params.accept instead of params.cancel. A cancel label without an accept label is shown as 'Cancel'.
  it.fails('uses the cancel label without an accept label', () => {
    toast({ cancel: 'No' });

    expect(actions().map((button) => button.textContent)).toEqual(['No']);
  });

  it('hides with the close button', async () => {
    const result = toast({ close: true, actions: [{ label: 'Save' }] });

    toastNode().querySelector('button.close').click();

    expect(toastNode().classList).toContain('ease-out');

    await expect(result).resolves.toBe('');
  });

  it('shows a logo', () => {
    toast({ logo: '/logo.svg' });

    expect(
      toastNode().querySelector('.toast-logo img').getAttribute('src'),
    ).toBe('/logo.svg');
  });
});
