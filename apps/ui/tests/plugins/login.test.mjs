import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { login } from '../../lib/plugins/login.mjs';

// The plugin reads the login, authPath and dir data attributes of the document head. The setup assigns the testhost as dir.
const keys = ['login', 'authPath', 'dir'];

let dataset;

beforeEach(() => {
  dataset = Object.fromEntries(
    keys.map((key) => [key, document.head.dataset[key]]),
  );
});

afterEach(() => {
  delete mapp.user;

  for (const key of keys) {
    if (dataset[key] === undefined) {
      delete document.head.dataset[key];
    } else {
      document.head.dataset[key] = dataset[key];
    }
  }
});

/**
Returns a mapview stub with a mapButton element.
*/
function mapview() {
  return { mapButton: document.createElement('div'), locale: { key: 'test' } };
}

describe('plugins/login', () => {
  it('is in the plugins collection', () => {
    expect(plugins.login).toBe(login);
  });

  it('does nothing without a mapButton', () => {
    document.head.dataset.login = 'true';

    expect(() => login({}, {})).not.toThrow();
  });

  it('does not add the link without the login data attribute', () => {
    delete document.head.dataset.login;

    const mv = mapview();

    login({}, mv);

    expect(mv.mapButton.children).toHaveLength(0);
  });

  it('adds a login link without a mapp.user', () => {
    document.head.dataset.login = 'true';
    document.head.dataset.dir = '/dir';
    delete document.head.dataset.authPath;

    const mv = mapview();

    login({}, mv);

    const link = mv.mapButton.querySelector('a');

    // The href is asserted, the link is never followed.
    expect(link.getAttribute('href')).toBe('/dir/api/user/login');
    expect(link.title).toBe(mapp.dictionary.toolbar_login);

    const icon = link.querySelector('span');

    expect(icon.textContent).toBe('lock_open');
    expect(icon.classList.contains('color-danger')).toBe(false);
  });

  it('adds a logout link for a mapp.user', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    document.head.dataset.login = 'true';
    document.head.dataset.dir = '/dir';
    delete document.head.dataset.authPath;

    const mv = mapview();

    login({}, mv);

    const link = mv.mapButton.querySelector('a');

    expect(link.getAttribute('href')).toBe('/dir/api/user/logout');
    expect(link.title).toBe(mapp.dictionary.toolbar_logout);

    const icon = link.querySelector('span');

    expect(icon.textContent).toBe('logout');
    expect(icon.classList.contains('color-danger')).toBe(true);
  });

  it('uses the authPath data attribute', () => {
    document.head.dataset.login = 'true';
    document.head.dataset.authPath = '/auth';
    delete document.head.dataset.dir;

    const mv = mapview();

    login({}, mv);

    expect(mv.mapButton.querySelector('a').getAttribute('href')).toBe(
      '/auth/login',
    );
  });
});
