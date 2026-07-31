/**
## /tests/browser/ui/elements/toast

The codi version called `toast()` and asserted nothing at all -- it only checked
that the call did not throw.

`toast()` returns a promise that resolves to the value of the action button the
user picks, so the element itself is found in the document rather than taken
from the return value.

@module /tests/browser/ui/elements/toast
*/

import { afterEach, describe, expect, it } from 'vitest';

/**
@function toastElement

@description
The toast appended to the document by the last call.

@returns {HTMLElement} The toast element.
*/
const toastElement = () =>
  document.querySelector('[data-id=ui-elements-toast]');

describe('ui/elements/toast', () => {
  afterEach(() => {
    toastElement()?.remove();
  });

  it('appends a toast carrying the content to the document', () => {
    mapp.ui.elements.toast({
      actions: [{ label: 'Accept', value: 'true' }],
      content: 'I am content',
    });

    const toast = toastElement();

    expect(toast).toBeInstanceOf(HTMLElement);
    expect(toast.textContent).toContain('I am content');
  });

  it('renders a button for every action', () => {
    mapp.ui.elements.toast({
      actions: [
        { label: 'Accept', value: 'true' },
        { label: 'Reject', value: 'false' },
      ],
      content: 'I am content',
    });

    expect(toastElement().querySelectorAll('button')).toHaveLength(2);
  });

  it('resolves to the value of the button pressed', async () => {
    const promise = mapp.ui.elements.toast({
      actions: [
        { label: 'Accept', value: 'true' },
        { label: 'Reject', value: 'false' },
      ],
      content: 'I am content',
    });

    toastElement().querySelectorAll('button')[1].click();

    await expect(promise).resolves.toEqual('false');
  });
});
