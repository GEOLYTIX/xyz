import { describe, expect, it, vi } from 'vitest';

const { chkbox } = mapp.ui.elements;

function input(node) {
  return node.querySelector('input');
}

describe('ui/elements/chkbox', () => {
  it('creates a labelled checkbox with defaults', () => {
    const node = chkbox({ label: 'Show' });

    expect(node.tagName).toBe('LABEL');
    expect(node.dataset.id).toBe('chkbox');
    expect(node.classList).toContain('checkbox');
    expect(node.textContent).toContain('Show');

    expect(input(node).type).toBe('checkbox');
    expect(input(node).name).toBe('mapp-ui-chkbox-element');
    expect(input(node).checked).toBe(false);
    expect(input(node).disabled).toBe(false);
  });

  it('assigns the checked, disabled, name and data_id params', () => {
    const node = chkbox({
      label: 'Show',
      checked: true,
      disabled: true,
      name: 'display',
      data_id: 'display-chkbox',
    });

    expect(node.dataset.id).toBe('display-chkbox');
    expect(input(node).name).toBe('display');
    expect(input(node).checked).toBe(true);
    expect(input(node).disabled).toBe(true);
  });

  it('calls onchange with the checked state and the val param', () => {
    const onchange = vi.fn();

    const node = chkbox({ label: 'Show', val: 'a', onchange });

    // A click on a checkbox which is not in the document doesn't dispatch a change event.
    document.body.append(node);

    input(node).click();

    expect(onchange).toHaveBeenCalledWith(true, 'a');

    input(node).click();

    expect(onchange).toHaveBeenLastCalledWith(false, 'a');

    node.remove();
  });

  it('can be toggled without an onchange method', () => {
    const node = chkbox({ label: 'Show' });

    expect(() => input(node).click()).not.toThrow();
    expect(input(node).checked).toBe(true);
  });
});
