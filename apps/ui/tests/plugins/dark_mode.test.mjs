import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { custom_theme, dark_mode } from '../../lib/plugins/dark_mode.mjs';
import { setTheme, themes } from '../../lib/utils/cssColourTheme.mjs';

const root = document.querySelector(':root');

afterEach(() => {
  delete mapp.user;

  // Remove the theme colour variables from the :root element.
  setTheme({});
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

/**
Returns a mapview stub with a mapButton element.
*/
function mapview() {
  return { mapButton: document.createElement('div'), locale: { key: 'test' } };
}

describe('plugins/dark_mode', () => {
  it('is in the plugins collection', () => {
    expect(plugins.dark_mode).toBe(dark_mode);
    expect(plugins.custom_theme).toBe(custom_theme);
  });

  it('does nothing without a mapButton', () => {
    mapp.user = { dark_mode: true };

    dark_mode({}, {});

    expect(root.style.getPropertyValue('--color-base')).toBe('');
  });

  it('toggles the dark theme without a mapp.user', () => {
    const mv = mapview();

    dark_mode({}, mv);

    const btn = mv.mapButton.querySelector('[data-id=dark_mode]');

    expect(btn.title).toBe(mapp.dictionary.dark_mode);
    expect(btn.textContent.trim()).toBe('dark_mode');
    expect(root.style.getPropertyValue('--color-base')).toBe('');

    btn.click();

    expect(root.style.getPropertyValue('--color-base')).toBe(themes.dark.base);
    expect(btn.textContent.trim()).toBe('light_mode');

    btn.click();

    expect(root.style.getPropertyValue('--color-base')).toBe('');
    expect(btn.textContent.trim()).toBe('dark_mode');
  });

  it('applies the dark theme for a user with the dark_mode flag', () => {
    mapp.user = { email: 'user@geolytix.co.uk', dark_mode: true };

    const mv = mapview();

    dark_mode({}, mv);

    expect(root.style.getPropertyValue('--color-base')).toBe(themes.dark.base);
    expect(mv.mapButton.textContent.trim()).toBe('light_mode');
  });

  it('stores the dark_mode flag of the user', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const put = mockIndexedDB();

    const mv = mapview();

    dark_mode({}, mv);

    mv.mapButton.querySelector('button').click();

    expect(mapp.user.dark_mode).toBe(true);
    expect(put).toHaveBeenCalledWith({
      store: 'user',
      name: 'user@geolytix.co.uk',
      obj: mapp.user,
    });
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3113: the updateUser JSDoc says that the roles, admin and blocked flags are removed from the stored user, but the live mapp.user is passed to the userIndexedDB put method.
  it.fails(
    'removes the roles, admin and blocked flags from the stored user',
    () => {
      mapp.user = {
        email: 'user@geolytix.co.uk',
        admin: true,
        roles: ['foo'],
        blocked: false,
      };

      const put = mockIndexedDB();

      const mv = mapview();

      dark_mode({}, mv);

      mv.mapButton.querySelector('button').click();

      const { obj } = put.mock.calls[0][0];

      expect(obj).not.toHaveProperty('admin');
      expect(obj).not.toHaveProperty('roles');
      expect(obj).not.toHaveProperty('blocked');
    },
  );

  it('applies a custom theme', () => {
    custom_theme({ base: '#123456' });

    expect(root.style.getPropertyValue('--color-base')).toBe('#123456');
  });
});
