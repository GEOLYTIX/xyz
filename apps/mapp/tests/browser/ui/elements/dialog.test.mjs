/**
## /tests/browser/ui/elements/dialog

@module /tests/browser/ui/elements/dialog
*/

import { afterEach, describe, expect, it } from 'vitest';

describe('ui/elements/dialog', () => {
  let target;

  afterEach(() => {
    target?.remove();
    target = undefined;
  });

  /**
  @function createTarget

  @description
  A sized container for the dialog, mounted in the document so that layout and
  positioning behave.

  @returns {HTMLElement} The target element.
  */
  function createTarget() {
    target = document.createElement('div');
    target.style.height = '600px';
    target.style.width = '800px';
    document.body.append(target);
    return target;
  }

  it('decorates the configuration with show and close methods', () => {
    const decorated = mapp.ui.elements.dialog({
      content: 'Dialog Content',
      header: 'Dialog Header',
      target: createTarget(),
    });

    expect(typeof decorated.show).toEqual('function');
    expect(typeof decorated.close).toEqual('function');
  });

  it('appends a dialog element carrying the header and content', () => {
    mapp.ui.elements.dialog({
      content: 'Dialog Content',
      header: 'Dialog Header',
      target: createTarget(),
    });

    const element = target.querySelector('[data-id=dialog]');

    expect(element).not.toBeNull();
    expect(element.textContent).toContain('Dialog Header');
    expect(element.textContent).toContain('Dialog Content');
  });

  it('applies the data_id', () => {
    mapp.ui.elements.dialog({
      content: 'Dialog Content',
      data_id: 'custom-dialog',
      target: createTarget(),
    });

    expect(target.querySelector('[data-id=custom-dialog]')).not.toBeNull();
  });

  it('removes the element on close', () => {
    const decorated = mapp.ui.elements.dialog({
      content: 'Dialog Content',
      target: createTarget(),
    });

    expect(target.querySelector('[data-id=dialog]')).not.toBeNull();

    decorated.close();

    expect(target.querySelector('[data-id=dialog]')).toBeNull();
  });

  it('renders a close button when configured', () => {
    mapp.ui.elements.dialog({
      closeBtn: true,
      content: 'Dialog Content',
      target: createTarget(),
    });

    expect(
      target.querySelector('[data-id=dialog] button.close'),
    ).not.toBeNull();
  });

  it('reuses an existing dialog rather than creating a second', () => {
    const decorated = mapp.ui.elements.dialog({
      content: 'Dialog Content',
      target: createTarget(),
    });

    mapp.ui.elements.dialog(decorated);

    expect(target.querySelectorAll('[data-id=dialog]')).toHaveLength(1);
  });
});
