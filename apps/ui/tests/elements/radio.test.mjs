import { describe, expect, it, vi } from 'vitest';

const { radio } = mapp.ui.elements;

function input(node) {
  return node.querySelector('input[type=radio]');
}

describe('ui/elements/radio', () => {
  it('creates a labelled radio button with defaults', () => {
    const node = radio({});

    expect(input(node).dataset.id).toBe('radio');
    expect(input(node).name).toBe('mapp-ui-radio-element');
    expect(input(node).checked).toBe(false);
    expect(node.textContent).toContain('No label defined');
    expect(node.querySelector('legend')).toBeNull();
  });

  it('renders the caption as legend', () => {
    const node = radio({ label: 'A', caption: 'Options' });

    expect(node.querySelector('legend').textContent).toBe('Options');
  });

  it('assigns the checked and disabled params', () => {
    const node = radio({ label: 'A', checked: true, disabled: true });

    expect(input(node).checked).toBe(true);
    expect(input(node).disabled).toBe(true);
  });

  it('checks one radio button of a group', () => {
    const onchange = vi.fn();

    const a = radio({ label: 'A', name: 'group', onchange });
    const b = radio({ label: 'B', name: 'group', checked: true, onchange });

    document.body.append(a, b);

    input(a).click();

    expect(input(a).checked).toBe(true);
    expect(input(b).checked).toBe(false);

    // The onchange is called with the event and the params of the checked radio.
    expect(onchange).toHaveBeenCalledTimes(1);
    expect(onchange.mock.calls[0][1].label).toBe('A');

    a.remove();
    b.remove();
  });
});
