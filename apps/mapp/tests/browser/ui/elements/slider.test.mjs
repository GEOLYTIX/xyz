/**
## /tests/lib/ui/elements/slider

The codi suite reached the slider params by adding a GeoJSON layer to a live
mapview and filtering the decorated `layer.infoj`. The slider only reads the
infoj entry, so the fixture entry is passed straight in.

@module /tests/lib/ui/elements/slider
*/

import { describe, expect, it } from 'vitest';
// The infoj fixtures are the contract between the server and the client, so the
// definition is read from the xyz test assets rather than copied into this
// package. The browser project allows the path through server.fs.allow.
import sliderInfoj from '../../../../../xyz/tests/assets/infoj/slider.json';

const [entry] = sliderInfoj.infoj;

describe('ui/elements/slider', () => {
  it('builds a range input bounded by the entry min and max', () => {
    const node = mapp.ui.elements.slider({ ...entry });

    const range = node.querySelector('input[type=range]');

    expect(range).not.toBeNull();
    expect(range.getAttribute('min')).toEqual('-100000');
    expect(range.getAttribute('max')).toEqual('10000');
    expect(range.getAttribute('step')).toEqual('1');
  });

  it('builds a numeric input alongside the range input', () => {
    const node = mapp.ui.elements.slider({ ...entry });

    // The slider pairs the range input with a numericInput element, which
    // handles formatting and numeric checks.
    expect(node.querySelectorAll('input')).toHaveLength(2);
  });

  it('drives the numeric input from the range input', () => {
    const values = [];

    // A callback is not optional in practice: numericInput calls
    // params.callback() unguarded on input, so a slider built without one
    // throws as soon as the range is moved.
    const node = mapp.ui.elements.slider({
      ...entry,
      callback: (value) => values.push(value),
    });

    const range = node.querySelector('input[type=range]');
    const [numeric] = node.querySelectorAll('input');

    range.value = '500';
    range.dispatchEvent(new Event('input'));

    expect(numeric.value).toContain('500');

    // The callback receives the unformatted value as a string.
    expect(values).toContain('500');
  });
});
