import { afterEach, describe, expect, it } from 'vitest';
import plugins from '../../lib/plugins/_plugins.mjs';
import { admin } from '../../lib/plugins/admin.mjs';

afterEach(() => {
  delete mapp.user;
});

/**
Returns a mapview stub with a mapButton element.
*/
function mapview() {
  return { mapButton: document.createElement('div'), locale: { key: 'test' } };
}

describe('plugins/admin', () => {
  it('is in the plugins collection', () => {
    expect(plugins.admin).toBe(admin);
  });

  it('does nothing without a mapButton', () => {
    mapp.user = { admin: true };

    expect(() => admin({}, {})).not.toThrow();
  });

  it('does not add the link without a mapp.user', () => {
    const mv = mapview();

    admin({}, mv);

    expect(mv.mapButton.children).toHaveLength(0);
  });

  it('does not add the link for a user who is not an admin', () => {
    mapp.user = { email: 'user@geolytix.co.uk' };

    const mv = mapview();

    admin({}, mv);

    expect(mv.mapButton.children).toHaveLength(0);
  });

  it('adds a link to the admin view for an admin user', () => {
    mapp.user = { email: 'admin@geolytix.co.uk', admin: true };

    const mv = mapview();

    admin({}, mv);

    const link = mv.mapButton.querySelector('a');

    // The href is asserted, the link is never followed.
    expect(link.getAttribute('href')).toBe(`${mapp.host}/api/user/admin`);
    expect(link.title).toBe(mapp.dictionary.toolbar_admin);
    expect(link.querySelector('span').textContent).toBe('supervisor_account');
  });
});
