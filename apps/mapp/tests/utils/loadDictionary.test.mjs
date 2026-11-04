import { afterEach, describe, expect, it, vi } from 'vitest';
import loadDictionary from '../../lib/utils/loadDictionary.mjs';

describe('utils/loadDictionary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete mapp.dictionaries.xx;
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.loadDictionary).toBe(loadDictionary);
  });

  it('fetches a language from the public dictionaries and merges it into mapp.dictionaries', async () => {
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(Response.json({ hello: 'Hallo', bye: 'Tschüss' }));

    mapp.dictionaries.xx = { hello: 'old', keep: 'kept' };

    await loadDictionary('xx');

    expect(fetch).toHaveBeenCalledWith(
      `${mapp.host}/public/dictionaries/xx.json`,
    );

    expect(mapp.dictionaries.xx).toEqual({
      hello: 'Hallo',
      bye: 'Tschüss',
      keep: 'kept',
    });
  });

  it('creates a dictionary for a new language', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      Response.json({ hello: 'Hola' }),
    );

    await loadDictionary('xx');

    expect(mapp.dictionaries.xx).toEqual({ hello: 'Hola' });
  });

  it('logs an error if the dictionary cannot be fetched', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const err = new TypeError('Failed to fetch');

    vi.spyOn(globalThis, 'fetch').mockRejectedValue(err);

    await loadDictionary('xx');

    expect(error).toHaveBeenCalledWith('Failed to fetch language "xx":', err);
    expect(mapp.dictionaries.xx).toBeUndefined();
  });

  it('logs an error if the response is not json', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html>'));

    await loadDictionary('xx');

    expect(error).toHaveBeenCalledOnce();
    expect(mapp.dictionaries.xx).toBeUndefined();
  });
});
