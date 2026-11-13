import { afterEach, describe, expect, it, vi } from 'vitest';
import { dictionaries, dictionary } from '../lib/dictionary.mjs';

const language = mapp.language;

describe('dictionary', () => {
  afterEach(() => {
    mapp.language = language;
    delete mapp.dictionaries.xx;
    delete mapp.dictionaries.en.dictionary_test_en_only;
    vi.restoreAllMocks();
  });

  it('is assigned to mapp', () => {
    expect(mapp.dictionary).toBe(dictionary);
    expect(mapp.dictionaries).toBe(dictionaries);
    expect(Object.keys(dictionaries.en).length).toBeGreaterThan(0);
  });

  it('returns the entry for the mapp.language', () => {
    mapp.dictionaries.xx = { dictionary_test: 'xx entry' };
    mapp.language = 'xx';

    expect(dictionary.dictionary_test).toBe('xx entry');
  });

  it('falls back to the english entry', () => {
    mapp.dictionaries.xx = {};
    mapp.dictionaries.en.dictionary_test_en_only = 'en entry';
    mapp.language = 'xx';

    expect(dictionary.dictionary_test_en_only).toBe('en entry');
  });

  it('returns the key without an entry', () => {
    expect(dictionary.dictionary_test_missing_key).toBe(
      'dictionary_test_missing_key',
    );
  });

  it('sets the language to english if the mapp.language has no dictionary', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    mapp.dictionaries.en.dictionary_test_en_only = 'en entry';
    mapp.language = 'unsupported';

    expect(dictionary.dictionary_test_en_only).toBe('en entry');
    expect(mapp.language).toBe('en');
    expect(warn).toHaveBeenCalledWith(
      `'unsupported' mapp.language is not supported by mapp.dictionaries.`,
    );
  });
});
