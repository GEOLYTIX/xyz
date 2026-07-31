/**
## /tests/lib/dictionary

`mapp.dictionary` is a Proxy. Its getter resolves a key against the dictionary
for `mapp.language`, falls back to English, and returns the key itself when
neither has an entry.

The codi suite asserted the unsupported language fallback by having `_test.html`
set the page language to `TEST` before the tests ran, so the assertion only held
inside that one page. Setting `mapp.language` directly exercises the same branch
without the page.

@module /tests/lib/dictionary
*/

import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { mockConsole } from '../scaffold.mjs';

const mockWarnings = mockConsole('warn');

describe('dictionary', () => {
  let language;

  beforeAll(() => {
    language = mapp.language;
  });

  afterEach(() => {
    mapp.language = language;
  });

  it('resolves a key from the language dictionary', () => {
    mapp.language = 'en';

    expect(mapp.dictionary.layers).toEqual(mapp.dictionaries.en.layers);
  });

  it('falls back to English for a key missing from the language', () => {
    // mapp.dictionaries only holds `en` until loadDictionary fetches another,
    // so the partial language is registered here rather than loaded.
    mapp.dictionaries.xx = {};
    mapp.language = 'xx';

    const [key] = Object.keys(mapp.dictionaries.en);

    expect(mapp.dictionary[key]).toEqual(mapp.dictionaries.en[key]);

    delete mapp.dictionaries.xx;
  });

  it('returns the key itself when no dictionary has an entry', () => {
    mapp.language = 'en';

    expect(mapp.dictionary.a_key_no_dictionary_has).toEqual(
      'a_key_no_dictionary_has',
    );
  });

  it('warns and defaults to English for an unsupported language', () => {
    mapp.language = 'TEST';

    const value = mapp.dictionary.layers;

    expect(mockWarnings).toContain(
      `'TEST' mapp.language is not supported by mapp.dictionaries.`,
    );

    expect(mapp.language).toEqual('en');
    expect(value).toEqual(mapp.dictionaries.en.layers);
  });
});
