import { describe, expect, it, vi } from 'vitest';
import { entry, lidlLocation } from '../../helpers.mjs';
import { append, stubEntry } from './_helpers.mjs';

const { text } = mapp.ui.locations.entries;

/**
Selects the option at the index of the dropdown options in a container, like a user selection. The index 0 is the placeholder option.
*/
function select(container, index) {
  const select = container.querySelector('select');

  select.selectedIndex = index + 1;

  select.dispatchEvent(new Event('change'));
}

function optionTexts(container) {
  return [...container.querySelectorAll('option')].map((option) =>
    option.textContent.trim(),
  );
}

describe('ui/locations/entries/text', () => {
  it('returns without a value for an entry which is not editable', () => {
    const { entry } = stubEntry({ value: null });

    expect(text(entry)).toBeUndefined();
  });

  it('displays the value with the prefix, suffix and css_val', () => {
    const { entry } = stubEntry({
      value: 'a',
      prefix: '£',
      suffix: 'm',
      css_val: 'color: red;',
    });

    const node = text(entry);

    expect(node.classList).toContain('val');
    expect(node.textContent.trim()).toBe('£am');
    expect(node.style.color).toBe('red');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3132: the text method returns for a falsy value of an entry which is not editable, so a 0 value is not displayed.
  it.fails('displays a zero value', () => {
    const { entry } = stubEntry({ value: 0 });

    expect(text(entry).textContent.trim()).toBe('0');
  });

  describe('text input', () => {
    it('creates a text input with the value, maxlength and placeholder', () => {
      const { entry } = stubEntry({
        value: 'a',
        edit: { maxlength: 5, placeholder: 'Name' },
      });

      const input = text(entry);

      expect(input.type).toBe('text');
      expect(input.value).toBe('a');
      expect(input.maxLength).toBe(5);
      expect(input.placeholder).toBe('Name');
    });

    it('prefers the newValue as input value', () => {
      const { entry } = stubEntry({ value: 'a', newValue: 'b', edit: {} });

      expect(text(entry).value).toBe('b');
    });

    it('creates an empty input without a value', () => {
      const { entry } = stubEntry({ value: null, edit: {} });

      const input = text(entry);

      expect(input.value).toBe('');
      expect(input.placeholder).toBe('');
    });

    it('assigns the input value as newValue on keyup', () => {
      const { changes, entry } = stubEntry({ value: 'a', edit: {} });

      const input = text(entry);

      input.value = 'abc';

      input.dispatchEvent(new KeyboardEvent('keyup'));

      expect(entry.newValue).toBe('abc');
      expect(changes).toEqual([entry]);
    });

    it('splits the input value with the arraySeparator', () => {
      const { entry } = stubEntry({
        value: 'a',
        edit: { arraySeparator: ',' },
      });

      const input = text(entry);

      input.value = 'a,b';

      input.dispatchEvent(new KeyboardEvent('keyup'));

      expect(entry.newValue).toEqual(['a', 'b']);
    });
  });

  describe('edit options', () => {
    it('creates a dropdown for the options with the value as placeholder', async () => {
      const { entry } = stubEntry({
        value: 'b',
        edit: { options: ['a', 'b', { Other: 'c' }, null] },
      });

      const container = text(entry);

      expect(container).toBe(entry.container);

      await vi.waitFor(() =>
        expect(container.querySelector('select')).not.toBeNull(),
      );

      // The title of an object option is its key.
      expect(optionTexts(container)).toEqual(['b', 'a', 'b', 'Other', '']);
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3132: the value is assigned as dropdown placeholder, which takes precedence over the span with the title of the matched option.
    it.fails(
      'shows the title of the option which matches the value',
      async () => {
        const { entry } = stubEntry({
          value: 'c',
          edit: { options: [{ Other: 'c' }] },
        });

        const container = text(entry);

        await vi.waitFor(() =>
          expect(container.querySelector('select')).not.toBeNull(),
        );

        expect(optionTexts(container)[0]).toBe('Other');
      },
    );

    it('uses the edit placeholder without a value', async () => {
      const { entry } = stubEntry({
        edit: { options: ['a'], placeholder: 'Choose' },
      });

      const container = text(entry);

      await vi.waitFor(() =>
        expect(container.querySelector('select')).not.toBeNull(),
      );

      expect(optionTexts(container)[0]).toBe('Choose');
    });

    it('assigns the selected option as newValue', async () => {
      const { changes, entry } = stubEntry({
        value: 'a',
        edit: { options: ['a', { Other: 'c' }] },
      });

      const container = text(entry);

      await vi.waitFor(() =>
        expect(container.querySelector('select')).not.toBeNull(),
      );

      select(container, 1);

      expect(entry.newValue).toBe('c');
      expect(changes).toEqual([entry]);
    });

    it('queries the distinct values of the field for empty options', async () => {
      const { location } = await lidlLocation();

      const retailer = {
        ...entry(location, 'retailer'),
        edit: { options: [] },
      };

      const container = text(retailer);

      expect(container.textContent).toBe(mapp.dictionary.loading);

      await vi.waitFor(() =>
        expect(container.querySelector('select')).not.toBeNull(),
      );

      expect(retailer.edit.query).toBe('distinct_values');
      expect(retailer.edit.options).toContain('Lidl');
      expect(optionTexts(container)).toContain('Lidl');
      expect(optionTexts(container)[0]).toBe('Lidl');
    });

    it('queries the options again for a dynamic entry', async () => {
      const { location } = await lidlLocation();

      const retailer = {
        ...entry(location, 'retailer'),
        edit: { options: ['Other'], dynamic: true },
      };

      const container = text(retailer);

      await vi.waitFor(() =>
        expect(container.querySelector('select')).not.toBeNull(),
      );

      expect(retailer.edit.options).toContain('Lidl');
      expect(retailer.edit.options).not.toContain('Other');
    });

    it('queries the distinct json values for a jsonb field', async () => {
      const { location } = await lidlLocation();

      const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(null);

      const tag = {
        ...entry(location, 'retailer'),
        jsonb_field: 'props',
        jsonb_key: 'tag',
        edit: { options: [] },
      };

      const container = text(tag);

      await vi.waitFor(() =>
        expect(container.textContent).toBe(
          mapp.dictionary.no_options_available,
        ),
      );

      expect(tag.edit.query).toBe('distinct_values_json');

      const params = new URLSearchParams(
        xhr.mock.calls.at(-1)[0].split('?')[1],
      );

      expect(params.get('template')).toBe('distinct_values_json');
      expect(params.get('field')).toBe('props');
      expect(params.get('key')).toBe('tag');
    });

    it('creates a radio group for the radio flag', async () => {
      const { changes, entry } = stubEntry({
        field: 'category',
        value: 'b',
        edit: { options: ['a', 'b'], radio: true },
      });

      const container = append(text(entry));

      await vi.waitFor(() =>
        expect(container.querySelectorAll('input[type=radio]').length).toBe(2),
      );

      const radios = container.querySelectorAll('input[type=radio]');

      expect([...radios].map((radio) => radio.checked)).toEqual([false, true]);
      expect(radios[0].name).toBe('category');

      radios[0].click();

      expect(entry.newValue).toBe('a');
      expect(changes).toEqual([entry]);
    });

    it('does not check a radio for a value which is not an option', async () => {
      const { entry } = stubEntry({
        value: 'c',
        edit: { options: ['a', 'b'], radio: true },
      });

      const container = text(entry);

      await vi.waitFor(() =>
        expect(container.querySelectorAll('input[type=radio]').length).toBe(2),
      );

      expect(container.querySelector('input:checked')).toBeNull();
    });
  });
});
