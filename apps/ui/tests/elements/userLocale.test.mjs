import { describe, expect, it, vi } from 'vitest';
import { mockUserLocale } from './_helpers.mjs';

const { userLocale } = mapp.ui.elements;

/**
Returns a mapview stub with a locale.
*/
function mapview(locale = {}) {
  return {
    locale: { key: 'grocery', name: 'Grocery', workspace: 'ws', ...locale },
  };
}

/**
Returns the text and href of the userlocale links in the panel.
*/
function links(panel) {
  return [...panel.querySelectorAll('.user-locales li a')].map((a) => [
    a.textContent,
    a.getAttribute('href'),
  ]);
}

describe('ui/elements/userLocale', () => {
  it('creates a panel with the decoded locale name in the input', () => {
    const { list } = mockUserLocale();

    const params = {};

    const panel = userLocale(params, mapview({ name: 'My%20View' }));

    expect(panel).toBe(params.panel);
    expect(params.localeInput.value).toBe('My View');
    expect(panel.querySelector('h3').textContent).toBe(
      mapp.dictionary.user_locale_save,
    );
    expect(list).toHaveBeenCalledWith('ws');
  });

  it('lists the userlocales with links and delete buttons', async () => {
    mockUserLocale([
      { key: 'grocery', name: 'First%20View' },
      { key: 'scratch', name: 'Second' },
    ]);

    const params = {};

    userLocale(params, mapview());

    await vi.waitFor(() => expect(links(params.panel)).toHaveLength(2));

    expect(links(params.panel)).toEqual([
      // The encoded name is encoded again for the url param.
      ['First View', `${mapp.host}?locale=grocery&userlocale=First%2520View`],
      ['Second', `${mapp.host}?locale=scratch&userlocale=Second`],
    ]);

    expect(params.ulLocales.querySelector('h3').textContent).toBe(
      mapp.dictionary.user_locale_desc,
    );
    expect(params.ulLocales.querySelectorAll('li button')).toHaveLength(2);
  });

  it('renders an empty list without userlocales', async () => {
    const { list } = mockUserLocale();

    const params = {};

    userLocale(params, mapview());

    // A placeholder the empty-list render must replace.
    params.ulLocales.append(document.createElement('ul'));

    await vi.waitFor(() => expect(list).toHaveResolved());

    await vi.waitFor(() =>
      expect(params.ulLocales.querySelector('ul')).toBeNull(),
    );
    expect(params.ulLocales.children).toHaveLength(1);
    expect(params.ulLocales.firstElementChild.tagName).toBe('DIV');
    expect(params.ulLocales.textContent.trim()).toBe('');
  });

  it('saves the locale with the encoded name from the input', async () => {
    const { list, putLocale } = mockUserLocale();

    const params = {};

    const mv = mapview();

    userLocale(params, mv);

    params.localeInput.value = 'My View';

    list.mockResolvedValue([{ key: 'grocery', name: 'My%20View' }]);

    params.panel.querySelector('button').click();

    // The panel is disabled while the locale is saved.
    expect(params.panel.classList).toContain('disabled');

    await vi.waitFor(() => expect(links(params.panel)).toHaveLength(1));

    expect(putLocale).toHaveBeenCalledWith(mv);
    expect(mv.locale.name).toBe('My%20View');
    expect(params.panel.classList).not.toContain('disabled');
    expect(links(params.panel)[0][0]).toBe('My View');
  });

  it('removes a userlocale with the delete button', async () => {
    const { list, remove } = mockUserLocale([
      { key: 'grocery', name: 'Old' },
      { key: 'grocery', name: 'Keep' },
    ]);

    const params = {};

    const mv = mapview();

    userLocale(params, mv);

    await vi.waitFor(() => expect(links(params.panel)).toHaveLength(2));

    list.mockResolvedValue([{ key: 'grocery', name: 'Keep' }]);

    params.ulLocales.querySelector('li button').click();

    expect(params.panel.classList).toContain('disabled');

    await vi.waitFor(() => expect(links(params.panel)).toHaveLength(1));

    expect(remove).toHaveBeenCalledWith(mv.locale);
    expect(mv.locale.name).toBe('Old');
    expect(links(params.panel)[0][0]).toBe('Keep');
    expect(params.panel.classList).not.toContain('disabled');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3097: the disabled class is only removed if the putLocale response is the locale name. The panel stays disabled if the locale could not be saved.
  it.fails('enables the panel if the locale could not be saved', async () => {
    const { putLocale } = mockUserLocale();

    putLocale.mockResolvedValue(new Error('QuotaExceededError'));

    const params = {};

    userLocale(params, mapview());

    params.panel.querySelector('button').click();

    await vi.waitFor(() => expect(putLocale).toHaveResolved());

    await vi.waitFor(
      () => expect(params.panel.classList).not.toContain('disabled'),
      { timeout: 200 },
    );
  });
});
