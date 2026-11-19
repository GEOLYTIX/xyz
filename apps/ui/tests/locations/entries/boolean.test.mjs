import { describe, expect, it } from 'vitest';
import { append, stubEntry } from './_helpers.mjs';

const { boolean } = mapp.ui.locations.entries;

describe('ui/locations/entries/boolean', () => {
  it.each([
    [true, 'check'],
    [false, 'close'],
  ])('displays the %s value as %s icon with the label', (value, icon) => {
    const { entry } = stubEntry({ value, label: 'Flag' });

    const node = boolean(entry);

    expect(node.classList).toContain('link-with-img');
    expect(node.querySelector('.material-symbols-outlined').textContent).toBe(
      icon,
    );
    expect(node.querySelector('span').textContent).toBe('Flag');
  });

  it('assigns an empty label', () => {
    const { entry } = stubEntry({ value: true });

    expect(boolean(entry).querySelector('span').textContent).toBe('');
    expect(entry.label).toBe('');
  });

  it('creates a checkbox with the value and the label', () => {
    const { entry } = stubEntry({ value: true, label: 'Flag', edit: {} });

    const chkbox = boolean(entry);

    expect(chkbox.querySelector('input').checked).toBe(true);
    expect(chkbox.querySelector('input').disabled).toBe(false);
    expect(chkbox.textContent.trim()).toBe('Flag');
  });

  it('uses the title as checkbox label and the newValue as checked', () => {
    const { entry } = stubEntry({
      value: true,
      newValue: false,
      title: 'Title',
      edit: {},
    });

    const chkbox = boolean(entry);

    expect(chkbox.querySelector('input').checked).toBe(false);
    expect(chkbox.textContent.trim()).toBe('Title');
  });

  it('assigns the checked state as newValue', () => {
    const { changes, entry } = stubEntry({ value: false, edit: {} });

    const chkbox = append(boolean(entry));

    chkbox.querySelector('input').click();

    expect(entry.newValue).toBe(true);
    expect(changes).toEqual([entry]);
  });
});
