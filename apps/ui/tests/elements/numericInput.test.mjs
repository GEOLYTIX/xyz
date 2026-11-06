import { describe, expect, it, vi } from 'vitest';

const { numericInput, slider } = mapp.ui.elements;

/**
Params with an en-GB number format, so the formatted values don't depend on the browser locale.
*/
function params(config = {}) {
  return {
    formatterParams: { locale: 'en-GB' },
    callback: vi.fn(),
    ...config,
  };
}

/**
Sets the value of the input and dispatches an input or change event.
*/
function type(input, value, event = 'input') {
  input.value = value;
  input.dispatchEvent(new Event(event));
}

describe('ui/elements/numericInput', () => {
  it('creates a text input with the formatted value', () => {
    const node = numericInput(params({ value: 12345.6 }));

    expect(node.type).toBe('text');
    expect(node.dataset.id).toBe('numeric-input');
    expect(node.value).toBe('12,345.6');
    expect(node.style.width).toBe('100%');
  });

  it('formats the value with prefix and suffix', () => {
    const node = numericInput(params({ value: 5, prefix: '£', suffix: 'k' }));

    expect(node.value).toBe('£5k');
  });

  it('passes a valid value to the callback', () => {
    const config = params({ value: 1 });

    const node = numericInput(config);

    type(node, '1500');

    expect(config.callback).toHaveBeenCalledWith(1500);
    expect(config.newValue).toBe(1500);
    expect(config.invalid).toBeUndefined();
    expect(node.classList).not.toContain('invalid');
  });

  it('formats the value on change', () => {
    const node = numericInput(params({ value: 1 }));

    type(node, '1500', 'change');

    expect(node.value).toBe('1,500');
  });

  it('removes the format on focus', () => {
    const node = numericInput(params({ value: 1500 }));

    node.dispatchEvent(new Event('focus'));

    expect(node.value).toBe('1500');
  });

  it.each([
    ['not a number', 'abc', {}],
    ['smaller than min', '5', { min: 10 }],
    ['larger than max', '50', { max: 10 }],
  ])('marks a value which is %s as invalid', (_, value, limits) => {
    const config = params({ value: 1, ...limits });

    const node = numericInput(config);

    type(node, value);

    expect(config.invalid).toBe(true);
    expect(node.classList).toContain('invalid');

    // The callback is called without a value.
    expect(config.callback).toHaveBeenCalledWith();
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3033: the numericChecks method checks params.min only if it is truthy. A min of 0 is ignored and negative values are valid.
  it.fails('marks a value smaller than a min of 0 as invalid', () => {
    const config = params({ value: 1, min: 0 });

    const node = numericInput(config);

    type(node, '-5');

    expect(config.invalid).toBe(true);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3034: the numericChecks method checks the input string before the locale format is removed. A decimal with a decimal comma, eg. 1,5 in de-DE, is not a number and invalid.
  it.fails('accepts a decimal with the decimal separator of the locale', () => {
    const config = params({
      value: 1,
      formatterParams: { locale: 'de-DE' },
    });

    const node = numericInput(config);

    type(node, '1,5');

    expect(config.invalid).toBeUndefined();
    expect(config.callback).toHaveBeenCalledWith(1.5);
  });

  it('uses the numericChecks param', () => {
    const numericChecks = vi.fn(() => false);

    const config = params({ value: 1, numericChecks });

    const node = numericInput(config);

    type(node, '2');

    expect(numericChecks).toHaveBeenCalledWith('2', config);
    expect(config.invalid).toBe(true);
  });

  it('sets the width to the value length with dynamicWidth', () => {
    const node = numericInput(params({ value: 12345, dynamicWidth: true }));

    // 12,345 has 6 characters.
    expect(node.style.width).toBe('7.3ch');
  });
});

describe('ui/elements/slider', () => {
  function rangeInput(node) {
    return node.querySelector('input[type=range]');
  }

  function textInput(node) {
    return node.querySelector('input[type=text]');
  }

  it('creates a range input and a numeric input', () => {
    const node = slider(
      params({ label: 'Opacity', min: 0, max: 100, val: 40 }),
    );

    expect(node.dataset.id).toBe('slider');
    expect(node.querySelector('label').textContent).toContain('Opacity');

    expect(rangeInput(node).min).toBe('0');
    expect(rangeInput(node).max).toBe('100');
    expect(rangeInput(node).step).toBe('1');
    expect(rangeInput(node).value).toBe('40');

    expect(textInput(node).value).toBe('40');
    expect(node.style.getPropertyValue('--a').trim()).toBe('40');
  });

  it('uses the data_id as group_id', () => {
    const node = slider(params({ data_id: 'opacity', min: 0, max: 1 }));

    expect(node.dataset.id).toBe('opacity');
  });

  it('updates the numeric input and calls the callback on range input', () => {
    const config = params({ min: 0, max: 100, value: 40 });

    const node = slider(config);

    type(rangeInput(node), '75');

    expect(textInput(node).value).toBe('75');
    expect(config.callback).toHaveBeenCalledWith('75');
    expect(node.style.getPropertyValue('--a').trim()).toBe('75');
  });

  it('updates the range input on a valid numeric input', () => {
    const config = params({ min: 0, max: 100, value: 40 });

    const node = slider(config);

    type(textInput(node), '60');

    expect(rangeInput(node).value).toBe('60');
    expect(config.callback).toHaveBeenCalledWith(60);
  });

  it('does not update the range input on an invalid numeric input', () => {
    const config = params({ min: 0, max: 100, value: 40 });

    const node = slider(config);

    type(textInput(node), '150');

    expect(rangeInput(node).value).toBe('40');
    expect(textInput(node).classList).toContain('invalid');
  });
});
