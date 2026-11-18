import { describe, expect, it, vi } from 'vitest';
import { stubEntry } from './_helpers.mjs';

const { html, textarea } = mapp.ui.locations.entries;

describe('ui/locations/entries/textarea', () => {
  it('displays the value with the css_val', () => {
    const { entry } = stubEntry({ value: 'a\nb', css_val: 'color: red;' });

    const node = textarea(entry);

    expect(node.classList).toContain('val');
    expect(node.textContent).toBe('a\nb');
    expect(node.style.color).toBe('red');
  });

  it('assigns an empty css_val', () => {
    const { entry } = stubEntry({ value: 'a' });

    textarea(entry);

    expect(entry.css_val).toBe('');
  });

  it('renders the value of a html entry as html', () => {
    const { entry } = stubEntry({ type: 'html', value: '<b>bold</b>' });

    const node = html(entry);

    expect(node.querySelector('b').textContent).toBe('bold');
  });

  it('renders an empty html entry without a value', () => {
    const { entry } = stubEntry({ type: 'html', value: null });

    expect(html(entry).innerHTML).toBe('');
  });

  it('creates a textarea with the value, maxlength and placeholder', () => {
    const { entry } = stubEntry({
      value: 'a',
      edit: { maxlength: 5, placeholder: 'Notes' },
    });

    const el = textarea(entry).querySelector('textarea');

    expect(el.value.trim()).toBe('a');
    expect(el.maxLength).toBe(5);
    expect(el.placeholder).toBe('Notes');
  });

  it('prefers the newValue as textarea value', () => {
    const { entry } = stubEntry({ value: 'a', newValue: 'b', edit: {} });

    expect(textarea(entry).querySelector('textarea').value.trim()).toBe('b');
  });

  it('creates an empty textarea for a html entry', () => {
    const { entry } = stubEntry({ type: 'html', edit: {} });

    const el = textarea(entry).querySelector('textarea');

    expect(el.value.trim()).toBe('');
    expect(el.placeholder).toBe('');
  });

  it('assigns the textarea value as newValue on keyup', () => {
    const { changes, entry } = stubEntry({ value: 'a', edit: {} });

    const el = textarea(entry).querySelector('textarea');

    el.value = 'abc';

    el.dispatchEvent(new KeyboardEvent('keyup'));

    expect(entry.newValue).toBe('abc');
    expect(changes).toEqual([entry]);
  });

  it('resizes the textarea on focus, focusout and keydown', () => {
    vi.useFakeTimers();

    const { entry } = stubEntry({ value: 'a', edit: {} });

    const el = textarea(entry).querySelector('textarea');

    el.dispatchEvent(new FocusEvent('focus'));

    expect(el.style.height).toBe(`${el.scrollHeight}px`);

    el.dispatchEvent(new FocusEvent('focusout'));

    expect(el.style.height).toBe('auto');

    el.style.height = '1px';

    el.dispatchEvent(new KeyboardEvent('keydown'));

    vi.advanceTimersByTime(100);

    expect(el.style.height).toBe(`${el.scrollHeight}px`);

    vi.useRealTimers();
  });
});
