import { describe, expect, it, vi } from 'vitest';

const { card, btnPanel, tooltip } = mapp.ui.elements;

describe('ui/elements/card', () => {
  it('creates a drawer with header and content', () => {
    const content = mapp.utils.html.node`<p>content`;

    const node = card({ header: 'Title', content });

    expect(node.dataset.id).toBe('card');
    expect(node.classList).toContain('drawer');
    expect(node.querySelector('header span').textContent).toBe('Title');
    expect(node.contains(content)).toBe(true);
  });

  it('removes the card and calls close on the close button', () => {
    const close = vi.fn();

    const node = card({ header: 'Title', data_id: 'my-card', close });

    document.body.append(node);

    node.querySelector('header button').click();

    expect(node.isConnected).toBe(false);
    expect(close).toHaveBeenCalledTimes(1);
    expect(node.dataset.id).toBe('my-card');
  });

  it('can be closed without a close method', () => {
    const node = card({ header: 'Title' });

    document.body.append(node);

    expect(() => node.querySelector('header button').click()).not.toThrow();
    expect(node.isConnected).toBe(false);
  });
});

describe('ui/elements/btnPanel', () => {
  it('creates a button with a header and panel', () => {
    const panel = mapp.utils.html.node`<div class="content">`;

    const node = btnPanel({
      label: 'Layers',
      icon_name: 'layers',
      panel,
      callback: () => {},
    });

    expect(node.tagName).toBe('BUTTON');
    expect(node.dataset.id).toBe('btnPanel');
    expect(node.className).toBe('btn-panel ');
    expect(node.querySelector('h3').textContent).toBe('Layers');
    expect(node.querySelector('.material-symbols-outlined').textContent).toBe(
      'layers',
    );
    expect(node.querySelector('.panel').contains(panel)).toBe(true);
  });

  it('toggles the active class and calls the callback on click', () => {
    const callback = vi.fn();

    const node = btnPanel({
      label: 'Layers',
      class: 'primary',
      data_id: 'layers-btn',
      callback,
    });

    expect(node.classList).toContain('primary');
    expect(node.dataset.id).toBe('layers-btn');
    expect(node.querySelector('.panel')).toBeNull();

    node.click();

    expect(node.classList).toContain('active');
    expect(callback).toHaveBeenCalledTimes(1);

    node.click();

    expect(node.classList).not.toContain('active');
  });
});

describe('ui/elements/tooltip', () => {
  it('creates a help icon with the content as title', () => {
    const params = { content: 'Help text' };

    const node = tooltip(params);

    expect(node.dataset.id).toBe('ui-elements-tooltip');
    expect(node.title).toBe('Help text');
    expect(node.textContent).toBe('help');
    expect(params.node).toBe(node);
  });

  it('warns and returns undefined without content', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(tooltip({ data_id: 'no-content' })).toBeUndefined();
    expect(warn).toHaveBeenCalledWith(
      'mapp.ui.elements.tooltip: content for no-content not provided.',
    );

    warn.mockRestore();
  });
});
