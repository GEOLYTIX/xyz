import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { userLocale } from '../../lib/plugins/userLocale.mjs';
import { mapTarget } from '../helpers.mjs';

afterEach(() => {
  delete mapp.user;
});

/**
Replaces the mapp.utils.userLocale namespace with a list mock, because the methods of the ESM namespace can't be spied on. The namespace is restored when the test finishes.

Returns the list mock.
*/
function mockUserLocale() {
  const list = vi.fn().mockResolvedValue([]);

  const utils = mapp.utils.userLocale;
  mapp.utils.userLocale = { ...utils, list };

  onTestFinished(() => {
    mapp.utils.userLocale = utils;
  });

  return list;
}

/**
Returns a mapview stub with a mapButton element and a locale.
*/
function mapview(locale = {}) {
  return {
    mapButton: document.createElement('div'),
    locale: { key: 'test', workspace: 'ws', ...locale },
  };
}

describe('plugins/userLocale', () => {
  it('is in the plugins collection', () => {
    expect(plugins.userLocale).toBe(userLocale);
  });

  it('does nothing without a mapp.user', () => {
    const list = mockUserLocale();

    const mv = mapview();

    userLocale({}, mv);

    expect(mv.mapButton.children).toHaveLength(0);
    expect(list).not.toHaveBeenCalled();
  });

  it('does nothing without a mapButton', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const list = mockUserLocale();

    expect(() => userLocale({}, { locale: { key: 'test' } })).not.toThrow();
    expect(list).not.toHaveBeenCalled();
  });

  it('toggles the userLocale dialog', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const list = mockUserLocale();
    const target = mapTarget();

    const mv = mapview();

    userLocale({}, mv);

    expect(list).toHaveBeenCalledWith('ws');

    const btn = mv.mapButton.querySelector('[data-id=user-locale]');

    btn.click();

    expect(btn.classList.contains('active')).toBe(true);

    const dialog = target.querySelector('dialog');

    expect(dialog.querySelector('h2').textContent).toBe('User Locale');
    expect(dialog.querySelector('input')).toBeTruthy();

    btn.click();

    expect(btn.classList.contains('active')).toBe(false);
    expect(dialog.isConnected).toBe(false);

    // The dialog is shown again on the next click.
    btn.click();

    expect(btn.classList.contains('active')).toBe(true);
    expect(dialog.isConnected).toBe(true);

    // The close button removes the active class.
    dialog.querySelector('[data-id=close]').click();

    expect(btn.classList.contains('active')).toBe(false);
    expect(dialog.isConnected).toBe(false);
  });

  it('shows the locale name in the input', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    mockUserLocale();
    const target = mapTarget();

    const mv = mapview({ name: 'My%20Locale' });

    userLocale({}, mv);

    mv.mapButton.querySelector('button').click();

    expect(target.querySelector('dialog input').value).toBe('My Locale');
  });

  // Known bug https://github.com/GEOLYTIX/xyz/issues/3118: the userLocale element decodes the undefined locale.name to the 'undefined' string, which is truthy. The input shows 'undefined' instead of the locale key.
  it.fails(
    'shows the locale key in the input for a locale without a name',
    () => {
      mapp.user = { email: 'user@geolytix.co.uk' };

      mockUserLocale();
      const target = mapTarget();

      const mv = mapview();

      userLocale({}, mv);

      mv.mapButton.querySelector('button').click();

      expect(target.querySelector('dialog input').value).toBe('test');
    },
  );
});
