/**
## /tests/browser/ui/elements/confirm

`confirm()` returns a promise resolving to true or false, the framework
alternative to `window.confirm()`. The dialog is found in the document rather
than returned, so the buttons are pressed through the DOM.

@module /tests/browser/ui/elements/confirm
*/

import { afterEach, describe, expect, it } from 'vitest';

/**
@function confirmElement

@description
The confirm dialog appended to the document by the last call.

@returns {HTMLElement} The dialog element.
*/
const confirmElement = () => document.querySelector('[data-id=confirm]');

/**
@function buttons

@description
The action buttons of the open confirm dialog.

@returns {Array} Button elements.
*/
const buttons = () => Array.from(confirmElement().querySelectorAll('button'));

describe('ui/elements/confirm', () => {
  afterEach(() => {
    confirmElement()?.remove();
  });

  it('appends a dialog carrying the text', () => {
    mapp.ui.elements.confirm({ text: 'Please confirm changes.' });

    expect(confirmElement()).toBeInstanceOf(HTMLElement);
    expect(confirmElement().textContent).toContain('Please confirm changes.');
  });

  it('renders a custom title', () => {
    mapp.ui.elements.confirm({
      text: 'Please confirm changes.',
      title: 'CONFIRM TITLE',
    });

    expect(confirmElement().textContent).toContain('CONFIRM TITLE');
  });

  it('renders innerContent in place of the text', () => {
    const innerContent = document.createElement('div');
    innerContent.textContent = 'CUSTOM CONTENT';

    mapp.ui.elements.confirm({
      innerContent,
      text: 'Please confirm changes.',
    });

    expect(confirmElement().textContent).toContain('CUSTOM CONTENT');
    expect(confirmElement().textContent).not.toContain(
      'Please confirm changes.',
    );
  });

  it('offers two actions', () => {
    mapp.ui.elements.confirm({ text: 'Please confirm changes.' });

    expect(buttons()).toHaveLength(2);
  });

  it('resolves true when confirmed', async () => {
    const promise = mapp.ui.elements.confirm({
      text: 'Please confirm changes.',
    });

    buttons()[0].click();

    await expect(promise).resolves.toBe(true);
  });

  it('resolves false when cancelled', async () => {
    const promise = mapp.ui.elements.confirm({
      text: 'Please confirm changes.',
    });

    buttons()[1].click();

    await expect(promise).resolves.toBe(false);
  });
});
