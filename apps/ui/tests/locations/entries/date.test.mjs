import { describe, expect, it, vi } from 'vitest';
import { stubEntry } from './_helpers.mjs';

const { date, datetime } = mapp.ui.locations.entries;

// 2024-01-02T03:04:05Z
const EPOCH = 1704164645;

describe('ui/locations/entries/date', () => {
  it('displays the formatted date of the value', () => {
    const { entry } = stubEntry({
      type: 'date',
      value: EPOCH,
      locale: 'en-GB',
      css_val: 'color: red;',
    });

    const node = date(entry);

    expect(node.classList).toContain('val');
    expect(node.textContent.trim()).toBe('02/01/2024');
    expect(node.style.color).toBe('red');
  });

  it('displays null without a value', () => {
    const { entry } = stubEntry({ type: 'date', value: null });

    expect(date(entry).textContent.trim()).toBe('null');
    expect(entry.css_val).toBe('');
  });

  it('creates a date input with the value', () => {
    const { entry } = stubEntry({ type: 'date', value: EPOCH, edit: {} });

    const input = date(entry);

    expect(input.type).toBe('date');
    expect(input.value).toBe('2024-01-02');
  });

  it('creates a datetime-local input with the value', () => {
    const { entry } = stubEntry({ type: 'datetime', value: EPOCH, edit: {} });

    const input = datetime(entry);

    expect(input.type).toBe('datetime-local');
    expect(input.value).toBe('2024-01-02T03:04:05');
  });

  it('prefers the newValue as input value', () => {
    const { entry } = stubEntry({
      type: 'date',
      value: EPOCH,
      newValue: EPOCH + 86400,
      edit: {},
    });

    expect(date(entry).value).toBe('2024-01-03');
  });

  it('creates an empty input without a value', () => {
    const { entry } = stubEntry({ type: 'date', edit: {} });

    expect(date(entry).value).toBe('');
  });

  it('assigns the current date as newValue for a true newValue', () => {
    const { changes, entry } = stubEntry({
      type: 'date',
      newValue: true,
      edit: {},
    });

    const now = Math.floor(Date.now() / 1000);

    const input = date(entry);

    expect(entry.newValue).toBeGreaterThanOrEqual(now);
    expect(entry.newValue).toBeLessThan(now + 5);
    expect(input.value).toBe(new Date().toISOString().split('T')[0]);
    expect(changes).toEqual([entry]);
  });

  it('warns for a string value', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { entry } = stubEntry({
      type: 'date',
      field: 'open_date',
      value: String(EPOCH),
      edit: {},
    });

    expect(date(entry).value).toBe('2024-01-02');
    expect(warn).toHaveBeenCalledWith(
      'date field: open_date should be an integer.',
    );
  });

  it('assigns the input date as unix epoch newValue on change', () => {
    const { changes, entry } = stubEntry({
      type: 'date',
      value: EPOCH,
      edit: {},
    });

    const input = date(entry);

    input.value = '2024-01-03';

    input.dispatchEvent(new Event('change'));

    expect(entry.newValue).toBe(
      Math.floor(new Date('2024-01-03').getTime() / 1000),
    );
    expect(changes).toEqual([entry]);
  });

  it('assigns a null newValue for an empty input', () => {
    const { changes, entry } = stubEntry({
      type: 'date',
      value: EPOCH,
      edit: {},
    });

    const input = date(entry);

    input.value = '';

    input.dispatchEvent(new Event('change'));

    expect(entry.newValue).toBeNull();
    expect(changes).toEqual([entry]);
  });
});
