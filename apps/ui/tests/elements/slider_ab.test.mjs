import { describe, expect, it, vi } from 'vitest';

const { slider_ab } = mapp.ui.elements;

/**
@function slider
@description
Creates a slider_ab element for the range 0 to 100 with the a value 10 and the b value 90, and mock callbacks.

@param {Object} [params] Properties to assign to the slider params.
@returns {Object} The slider params, element, and the range and numeric inputs.
*/
function slider(params) {
  params = {
    callback_a: vi.fn(),
    callback_b: vi.fn(),
    max: 100,
    min: 0,
    val_a: 10,
    val_b: 90,
    ...params,
  };

  const element = slider_ab(params);

  return {
    element,
    numericA: element.querySelector('input[data-id=a][type=text]'),
    numericB: element.querySelector('input[data-id=b][type=text]'),
    params,
    rangeA: element.querySelector('input[data-id=a][type=range]'),
    rangeB: element.querySelector('input[data-id=b][type=range]'),
  };
}

/**
@function change
@description
Assigns a value to an input and dispatches an event.

@param {HTMLInputElement} input The input element.
@param {string} value The input value.
@param {string} [type='change'] The event type.
*/
function change(input, value, type = 'change') {
  input.value = value;
  input.dispatchEvent(new Event(type));
}

describe('ui/elements/slider_ab', () => {
  it('creates a group with range and numeric inputs for the a and b values', () => {
    const { element, numericA, numericB, params, rangeA, rangeB } = slider();

    expect(element.getAttribute('role')).toBe('group');
    expect(element.dataset.id).toBe('slider_ab');
    expect(element.className).toBe('input-range multi');

    expect(element.style.getPropertyValue('--min').trim()).toBe('0');
    expect(element.style.getPropertyValue('--max').trim()).toBe('100');
    expect(element.style.getPropertyValue('--a').trim()).toBe('10');
    expect(element.style.getPropertyValue('--b').trim()).toBe('90');

    expect(rangeA).toMatchObject({
      max: '100',
      min: '0',
      name: 'minRangeInput',
      step: '1',
      value: '10',
    });
    expect(rangeB).toMatchObject({ name: 'maxRangeInput', value: '90' });

    expect(numericA.value).toBe('10');
    expect(numericB.value).toBe('90');

    expect(params.step).toBe(1);
  });

  it('assigns the data_id as group id and the step', () => {
    const { element, rangeA } = slider({ data_id: 'pop', step: 5 });

    expect(element.dataset.id).toBe('pop');
    expect(rangeA.step).toBe('5');
  });

  it('shows the formatted min and max with the showMinMax flag', () => {
    const { element } = slider({ max: 2000, prefix: '£' });

    const row = element.querySelector('.minmax-row');

    expect(row.classList).toContain('display-none');
    expect([...row.children].map((span) => span.textContent)).toEqual([
      '£0',
      '£2,000',
    ]);

    const showMinMax = slider({ showMinMax: true });

    expect(
      showMinMax.element.querySelector('.minmax-row').classList,
    ).not.toContain('display-none');
  });

  it('returns a message without a range', () => {
    const { element } = slider({ max: 10, min: 10, val_a: 10, val_b: 10 });

    expect(element.textContent).toBe('No available range for slider element.');
  });

  it('assigns the range input value to the numeric input', () => {
    const { element, numericA, numericB, params, rangeA, rangeB } = slider();

    change(rangeA, '20', 'input');

    expect(numericA.value).toBe('20');
    expect(params.callback_a).toHaveBeenCalledWith('20');
    expect(element.style.getPropertyValue('--a')).toBe('20');

    change(rangeB, '80', 'input');

    expect(numericB.value).toBe('80');
    expect(params.callback_b).toHaveBeenCalledWith('80');
    expect(element.style.getPropertyValue('--b')).toBe('80');
  });

  it('assigns the numeric input value to the range input', () => {
    const { numericA, numericB, params, rangeA, rangeB } = slider();

    change(numericA, '30');

    expect(rangeA.value).toBe('30');
    expect(params.callback_a).toHaveBeenCalledWith(30);
    expect(numericA.classList).not.toContain('invalid');

    change(numericB, '70', 'input');

    expect(rangeB.value).toBe('70');
    expect(params.callback_b).toHaveBeenCalledWith(70);
  });

  it.each([
    ['a', 'not a number'],
    ['a', '-1'],
    ['b', '101'],
    // The a value must not exceed the b value.
    ['a', '95'],
    // The b value must not be lower than the a value.
    ['b', '5'],
  ])('marks the numeric input %s with the value %s as invalid', (id, value) => {
    const result = slider();

    const input = id === 'a' ? result.numericA : result.numericB;

    const range = id === 'a' ? result.rangeA : result.rangeB;

    const rangeValue = range.value;

    change(input, value);

    expect(input.classList).toContain('invalid');

    // The callback is called without a value for an invalid input.
    expect(result.params[`callback_${id}`]).toHaveBeenCalledWith();

    // The range input is not changed.
    expect(range.value).toBe(rangeValue);
  });

  it('checks the a value against the changed b value', () => {
    const { numericA, numericB } = slider();

    change(numericB, '50');

    change(numericA, '60');

    expect(numericA.classList).toContain('invalid');

    change(numericA, '40');

    expect(numericA.classList).not.toContain('invalid');
  });
});
