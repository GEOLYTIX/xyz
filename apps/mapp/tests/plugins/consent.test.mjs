import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { consent } from '../../lib/plugins/consent.mjs';

afterEach(() => {
  delete mapp.user;
  vi.restoreAllMocks();
});

/**
Replaces the mapp.utils.userIndexedDB namespace with a put mock, because the methods of the ESM namespace can't be spied on. The namespace is restored when the test finishes.

Returns the put mock.
*/
function mockIndexedDB() {
  const put = vi.fn().mockResolvedValue('user@geolytix.co.uk');

  const userIndexedDB = mapp.utils.userIndexedDB;
  mapp.utils.userIndexedDB = { ...userIndexedDB, put };

  onTestFinished(() => {
    mapp.utils.userIndexedDB = userIndexedDB;
  });

  return put;
}

describe('plugins/consent', () => {
  it('is in the plugins collection', () => {
    expect(plugins.consent).toBe(consent);
  });

  it('does nothing without a mapp.user', async () => {
    const confirm = vi.spyOn(mapp.utils, 'confirm');

    await consent({ text: 'Do you consent?' }, {});

    expect(confirm).not.toHaveBeenCalled();
  });

  it('warns and returns without the consent text', async () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const confirm = vi.spyOn(mapp.utils, 'confirm');

    await consent({}, {});

    expect(warn).toHaveBeenCalledWith('consent plugin is missing consent text');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('does not show the dialog if consent was given before', async () => {
    mapp.user = { email: 'user@geolytix.co.uk', consent: true };

    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const confirm = vi.spyOn(mapp.utils, 'confirm');

    await consent({ text: 'Do you consent?' }, {});

    expect(log).toHaveBeenCalledWith('mapp.user has consent flag');
    expect(confirm).not.toHaveBeenCalled();
  });

  it('stores the user when the consent is confirmed', async () => {
    mapp.user = { email: 'user@geolytix.co.uk', language: 'en' };

    vi.spyOn(mapp.utils, 'confirm').mockResolvedValue(true);
    const put = mockIndexedDB();

    await consent({ text: 'Do you consent?' }, {});

    expect(mapp.user.consent).toBe(true);
    expect(put).toHaveBeenCalledWith({
      store: 'user',
      name: 'user@geolytix.co.uk',
      obj: mapp.user,
    });
  });

  it('does not store the user when the consent is declined', async () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    vi.spyOn(mapp.utils, 'confirm').mockResolvedValue(false);
    const put = mockIndexedDB();

    await consent({ text: 'Do you consent?' }, {});

    expect(mapp.user.consent).toBe(false);
    expect(put).not.toHaveBeenCalled();
  });

  it('defaults the dialog title from the dictionary', async () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    // The mapp.dictionary proxy reads the mapp.dictionaries and ignores
    // properties written to it, so the dictionary is replaced with a stub. The
    // distinct title is not the shipped 'Consent' entry, so a hardcoded title
    // would fail the test.
    const dictionary = mapp.dictionary;
    mapp.dictionary = { consent_title: 'Test consent title' };

    onTestFinished(() => {
      mapp.dictionary = dictionary;
    });

    const confirm = vi.spyOn(mapp.utils, 'confirm').mockResolvedValue(true);
    mockIndexedDB();

    const plugin = { text: 'Do you consent?' };

    await consent(plugin, {});

    expect(plugin.title).toBe('Test consent title');
    expect(confirm).toHaveBeenCalledWith(plugin);
  });

  it('keeps a title set in the plugin', async () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const confirm = vi.spyOn(mapp.utils, 'confirm').mockResolvedValue(true);
    mockIndexedDB();

    const plugin = { text: 'Do you consent?', title: 'Cookies' };

    await consent(plugin, {});

    expect(plugin.title).toBe('Cookies');
    expect(confirm).toHaveBeenCalledWith(plugin);
  });
});
