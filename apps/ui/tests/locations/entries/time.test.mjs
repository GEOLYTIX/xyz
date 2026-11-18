import { describe, expect, it } from 'vitest';
import { stubEntry } from './_helpers.mjs';

const { time } = mapp.ui.locations.entries;

describe('ui/locations/entries/time', () => {
  it('displays the numeric value as time', () => {
    const { entry } = stubEntry({ value: 10.43, css_val: 'color: red;' });

    const node = time(entry);

    expect(node.classList).toContain('val');
    expect(node.textContent.trim()).toBe('10:43');
    expect(node.style.color).toBe('red');
  });

  it('adds the minutes to an integer hour', () => {
    const { entry } = stubEntry({ value: 10 });

    expect(time(entry).textContent.trim()).toBe('10:00');
  });

  it('displays an empty node without a value', () => {
    const { entry } = stubEntry({ value: null });

    expect(time(entry).textContent.trim()).toBe('');
    expect(entry.css_val).toBe('');
  });

  it('creates a time input with the value', () => {
    const { entry } = stubEntry({ value: 10.43, edit: {} });

    const input = time(entry).querySelector('input');

    expect(input.type).toBe('time');
    expect(input.value).toBe('10:43');
  });

  it('assigns the input time as numeric newValue on change', () => {
    const { changes, entry } = stubEntry({ value: 10.43, edit: {} });

    const input = time(entry).querySelector('input');

    input.value = '08:15';

    input.dispatchEvent(new Event('change'));

    expect(entry.newValue).toBe(8.15);
    expect(changes).toEqual([entry]);
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3133: the value is converted with toString, so 10.5 for 10:50 becomes "10:5", which is not a valid time input value.
  it.fails(
    'creates a time input for a value with a zero last minute digit',
    () => {
      const { entry } = stubEntry({ value: 10.5, edit: {} });

      expect(time(entry).querySelector('input').value).toBe('10:50');
    },
  );

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3133: a single digit hour is not padded, so 9 becomes "9:00", which is not a valid time input value.
  it.fails('creates a time input for a single digit hour', () => {
    const { entry } = stubEntry({ value: 9, edit: {} });

    expect(time(entry).querySelector('input').value).toBe('09:00');
  });
});
