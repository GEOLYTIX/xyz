import { describe, expect, it, vi } from 'vitest';
import { optionTitles } from './_helpers.mjs';

const { locales } = mapp.ui.elements;

/**
Returns the select elements of the locale dropdowns.
*/
function selects(node) {
  return [...node.querySelectorAll('select')];
}

/**
Returns the text of the placeholder option of a select element.
*/
function placeholder(select) {
  return select.options[0].textContent.trim();
}

describe('ui/elements/locales', () => {
  it('returns undefined without locales', async () => {
    expect(await locales({ key: 'grocery' }, [])).toBeUndefined();
    expect(await locales({ key: 'grocery' })).toBeUndefined();
  });

  it('returns undefined for a single locale without nested locales', async () => {
    const xhr = vi.spyOn(mapp.utils, 'xhr');

    const node = await locales({ key: 'grocery', name: 'Grocery' }, [
      { key: 'grocery', name: 'Grocery' },
    ]);

    expect(node).toBeUndefined();

    // The nested locales of the grocery locale are requested from the workspace.
    expect(xhr).toHaveBeenCalledWith(
      `${mapp.host}/api/workspace/locales?locale=grocery`,
    );
  });

  it('creates a dropdown for the workspace locales', async () => {
    const node = await locales({ key: 'grocery', name: 'Grocery' }, [
      { key: 'grocery', name: 'Grocery' },
      { key: 'scratch', name: 'Scratch' },
    ]);

    // The test workspace locales have no nested locales.
    const [select] = selects(node);

    expect(selects(node)).toHaveLength(1);
    expect(select.dataset.id).toBe('locale-dropdown-0');
    expect(optionTitles(select)).toEqual(['Grocery', 'Scratch']);

    // The selected locale is the placeholder.
    expect(placeholder(select)).toBe('Grocery');
  });

  it('creates a dropdown for each level of a nested locale', async () => {
    const xhr = vi.spyOn(mapp.utils, 'xhr').mockImplementation(async (url) =>
      url.endsWith('locale=uk')
        ? [
            { key: 'uk,london', name: 'UK/London' },
            { key: 'uk,leeds', name: 'UK/Leeds' },
          ]
        : [],
    );

    const node = await locales(
      { key: 'london', keys: ['uk', 'london'], name: 'UK/London' },
      [
        { key: 'uk', name: 'UK' },
        { key: 'de', name: 'DE' },
      ],
    );

    expect(xhr.mock.calls.map(([url]) => url)).toEqual([
      `${mapp.host}/api/workspace/locales?locale=uk`,
      `${mapp.host}/api/workspace/locales?locale=uk,london`,
    ]);

    const [level0, level1] = selects(node);

    expect(selects(node)).toHaveLength(2);
    expect(placeholder(level0)).toBe('UK');
    expect(optionTitles(level0)).toEqual(['UK', 'DE']);

    expect(level1.dataset.id).toBe('locale-dropdown-1');
    expect(placeholder(level1)).toBe('London');

    // An option to step back to the parent locale is added to a nested level.
    expect(optionTitles(level1)).toEqual([
      mapp.dictionary.locale_back_option,
      'London',
      'Leeds',
    ]);
  });

  it('shows a placeholder for a level without a selected nested locale', async () => {
    vi.spyOn(mapp.utils, 'xhr').mockResolvedValue([
      { key: 'uk,london', name: 'UK/London' },
    ]);

    const node = await locales({ key: 'uk', name: 'UK' }, [
      { key: 'uk', name: 'UK' },
      { key: 'de', name: 'DE' },
    ]);

    const [, level1] = selects(node);

    expect(placeholder(level1)).toBe('Select nested locale');
    expect(optionTitles(level1)).toEqual(['London']);
  });

  it('doesn’t create a nested dropdown if the request fails', async () => {
    vi.spyOn(mapp.utils, 'xhr').mockResolvedValue(new Error('Bad Request'));

    const node = await locales({ key: 'uk', name: 'UK' }, [
      { key: 'uk', name: 'UK' },
      { key: 'de', name: 'DE' },
    ]);

    expect(selects(node)).toHaveLength(1);
  });
});
