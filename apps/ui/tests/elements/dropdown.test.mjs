import { describe, expect, it, vi } from 'vitest';

const { dropdown } = mapp.ui.elements;

function entries() {
  return [
    { title: 'Aldi', option: 'aldi' },
    { title: 'Lidl', option: 'lidl' },
    { title: 'Tesco', option: 'tesco' },
  ];
}

/**
Selects the option at the index of the entries, like a user selection in the select element. The index 0 is the placeholder option.
*/
function select(params, index) {
  params.select.selectedIndex = index + 1;
  params.select.dispatchEvent(new Event('change'));
}

function optionTexts(params) {
  return params.options.map((option) => option.textContent.trim());
}

function selected(params) {
  return params.options
    .filter((option) => option.classList.contains('selected'))
    .map((option) => option.value);
}

describe('ui/elements/dropdown', () => {
  it('creates a select with a placeholder and an option per entry', () => {
    const params = { entries: entries(), placeholder: 'Retailer' };

    dropdown(params);

    expect(params.select.dataset.id).toBe('dropdown');
    expect(optionTexts(params)).toEqual(['Retailer', 'Aldi', 'Lidl', 'Tesco']);
    expect(params.placeHolderOption.disabled).toBe(true);
    expect(params.select.selectedIndex).toBe(0);
  });

  it('removes entries with an empty option', () => {
    const params = { entries: [...entries(), { title: 'Empty', option: '' }] };

    dropdown(params);

    expect(params.entries).toHaveLength(3);
  });

  it('uses the label or field as option text without a title', () => {
    const params = {
      entries: [
        { label: 'Label', option: 'a' },
        { field: 'field', option: 'b' },
      ],
    };

    dropdown(params);

    expect(optionTexts(params).slice(1)).toEqual(['Label', 'field']);
  });

  it('uses the span as placeholder', () => {
    const params = { entries: entries(), span: 'Choose' };

    dropdown(params);

    expect(params.placeHolderOption.textContent.trim()).toBe('Choose');
  });

  describe('single select', () => {
    it('selects an entry and calls the callback with the entry', () => {
      const callback = vi.fn();

      const params = { entries: entries(), placeholder: 'Retailer', callback };

      dropdown(params);

      select(params, 1);

      expect(callback).toHaveBeenCalledWith(
        expect.any(Event),
        params.entries[1],
      );
      expect(params.entries[1].selected).toBe(true);
      expect(selected(params)).toEqual(['lidl']);
      expect(params.placeHolderOption.textContent).toBe('Lidl');

      // The select shows the placeholder option.
      expect(params.select.selectedIndex).toBe(0);
    });

    it('replaces the selected entry', () => {
      const params = { entries: entries() };

      dropdown(params);

      select(params, 0);
      select(params, 2);

      expect(selected(params)).toEqual(['tesco']);
      expect(params.placeHolderOption.textContent).toBe('Tesco');
    });

    it('keeps the placeholder with keepPlaceholder', () => {
      const params = {
        entries: entries(),
        placeholder: 'Retailer',
        keepPlaceholder: true,
      };

      dropdown(params);

      select(params, 0);

      expect(params.placeHolderOption.textContent.trim()).toBe('Retailer');
    });

    it('shows the title of a selected entry as placeholder', () => {
      const params = { entries: entries(), placeholder: 'Retailer' };

      params.entries[2].selected = true;

      dropdown(params);

      expect(params.placeHolderOption.textContent.trim()).toBe('Tesco');
      expect(selected(params)).toEqual(['tesco']);
    });
  });

  describe('multi select', () => {
    it('toggles entries and calls the callback with the selected options', () => {
      const callback = vi.fn();

      const params = {
        entries: entries(),
        placeholder: 'Retailer',
        multi: true,
        callback,
      };

      dropdown(params);

      select(params, 0);
      select(params, 2);

      expect(callback).toHaveBeenLastCalledWith(
        expect.any(Event),
        ['aldi', 'tesco'],
        params.entries[2],
      );
      expect(selected(params)).toEqual(['aldi', 'tesco']);
      expect(params.placeHolderOption.textContent).toBe('Aldi, Tesco');

      select(params, 0);

      expect(callback).toHaveBeenLastCalledWith(
        expect.any(Event),
        ['tesco'],
        params.entries[0],
      );
      expect(params.entries[0].selected).toBe(false);
      expect(params.placeHolderOption.textContent).toBe('Tesco');

      select(params, 2);

      expect(params.placeHolderOption.textContent).toBe('Retailer');
    });

    it('prevents the type-ahead selection of printable characters', () => {
      const params = { entries: entries(), multi: true };

      dropdown(params);

      const keydown = (key, init = {}) => {
        const event = new KeyboardEvent('keydown', {
          key,
          cancelable: true,
          ...init,
        });
        params.select.dispatchEvent(event);
        return event.defaultPrevented;
      };

      expect(keydown('t')).toBe(true);
      expect(keydown(' ')).toBe(false);
      expect(keydown('ArrowDown')).toBe(false);
      expect(keydown('a', { ctrlKey: true })).toBe(false);
    });

    it('sets the native multiple flag with the multiple param', () => {
      const params = { entries: entries(), multiple: true };

      dropdown(params);

      expect(params.select.multiple).toBe(true);
    });
  });

  describe('pills', () => {
    function pillValues(params) {
      return [...params.pills.container.querySelectorAll('.pill')].map(
        (pill) => pill.dataset.value,
      );
    }

    it('adds the selected entries as pills', () => {
      const callback = vi.fn();

      const params = { entries: entries(), multi: true, pills: true, callback };

      const node = dropdown(params);

      expect(node.firstElementChild).toBe(params.pills.container);

      select(params, 1);

      expect(pillValues(params)).toEqual(['Lidl']);
      expect(callback).toHaveBeenLastCalledWith(null, ['lidl']);
    });

    it('unselects the entry of a removed pill', () => {
      const callback = vi.fn();

      const params = { entries: entries(), multi: true, pills: true, callback };

      dropdown(params);

      select(params, 0);
      select(params, 1);

      params.pills.container.querySelector('[data-value=Aldi] button').click();

      expect(pillValues(params)).toEqual(['Lidl']);
      expect(params.entries[0].selected).toBe(false);
      expect(selected(params)).toEqual(['lidl']);
      expect(callback).toHaveBeenLastCalledWith(null, ['lidl']);
    });

    it('adds pills for entries selected on creation', () => {
      const callback = vi.fn();

      const params = { entries: entries(), multi: true, pills: true, callback };

      params.entries[0].selected = true;

      dropdown(params);

      expect(pillValues(params)).toEqual(['Aldi']);

      // The pills addCallback calls the callback during the creation.
      expect(callback).toHaveBeenCalledWith(null, ['aldi']);
    });
  });

  describe('search', () => {
    /**
    Selects a datalist option for the search input like a user, which inserts the option value as replacement text.
    */
    function searchSelect(node, value) {
      const input = node.querySelector('input');
      input.value = value;
      input.dispatchEvent(
        new InputEvent('input', { inputType: 'insertReplacementText' }),
      );
      return input;
    }

    it('creates a search input with a datalist of the entries', () => {
      const params = {
        entries: [{ title: 'Aldi', option: 'Aldi' }],
        search: true,
        field: 'retailer',
      };

      const node = dropdown(params);

      const input = node.querySelector('input');

      expect(input.type).toBe('search');
      expect(input.placeholder).toBe('Enter search term...');
      expect(input.getAttribute('list')).toBe('retailer-search-options');
      expect(
        node.querySelector('datalist#retailer-search-options option').value,
      ).toBe('Aldi​');
    });

    it('toggles the entry of a selected datalist option', () => {
      const callback = vi.fn();

      const params = {
        entries: [
          { title: 'Aldi', option: 'Aldi' },
          { title: 'Lidl', option: 'Lidl' },
        ],
        search: true,
        callback,
      };

      const node = dropdown(params);

      const input = searchSelect(node, 'Lidl​');

      expect(callback).toHaveBeenLastCalledWith(expect.any(Event), ['Lidl']);
      expect(input.value).toBe('');

      searchSelect(node, 'Lidl​');

      expect(callback).toHaveBeenLastCalledWith(expect.any(Event), []);
    });

    it('ignores typed characters', () => {
      const callback = vi.fn();

      const params = {
        entries: [{ title: 'Aldi', option: 'Aldi' }],
        search: true,
        callback,
      };

      const node = dropdown(params);

      const input = node.querySelector('input');
      input.value = 'Aldi';
      input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));

      expect(callback).not.toHaveBeenCalled();
    });

    // Known bug https://github.com/GEOLYTIX/xyz/issues/3037: the datalist option value is the entry option, but the onSearchInput method finds the entry by its title. An entry with a title different from its option can't be selected from the datalist.
    it.fails('selects an entry with a title different from the option', () => {
      const callback = vi.fn();

      const params = {
        entries: [{ title: 'Aldi Stores', option: 'aldi' }],
        search: true,
        callback,
      };

      const node = dropdown(params);

      searchSelect(node, 'aldi​');

      expect(callback).toHaveBeenCalledWith(expect.any(Event), ['aldi']);
    });
  });
});
