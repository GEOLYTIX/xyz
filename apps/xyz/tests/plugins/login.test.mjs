import { beforeEach, describe, expect, it } from 'vitest';
import { login } from '../../../mapp/lib/plugins/login.mjs';

describe('login plugin:', () => {
  let appended;

  beforeEach(() => {
    appended = undefined;

    globalThis.document = {
      head: {
        dataset: {
          authPath: '/saml',
          dir: '/app',
          login: 'true',
        },
      },
    };

    globalThis.mapp = {
      dictionary: {
        toolbar_login: 'Log in',
        toolbar_logout: 'Log out',
      },
      user: undefined,
      utils: {
        html: {
          node: (_strings, title, href, iconClass, iconName) => ({
            href,
            iconClass,
            iconName,
            title,
          }),
        },
      },
    };
  });

  it('uses DIR and AUTH_PATH for SAML logout links', () => {
    mapp.user = { email: 'test@example.com', sessionIndex: 'session-index' };

    login({}, mapview());

    expect(appended).toMatchObject({
      href: '/app/saml/logout',
      iconName: 'logout',
      title: 'Log out',
    });
  });

  it('uses DIR and AUTH_PATH for SAML login links', () => {
    login({}, mapview());

    expect(appended).toMatchObject({
      href: '/app/saml/login',
      iconName: 'lock_open',
      title: 'Log in',
    });
  });

  it('falls back to query flags when no AUTH_PATH is configured', () => {
    delete document.head.dataset.authPath;
    mapp.user = { email: 'test@example.com' };

    login({}, mapview());

    expect(appended.href).toBe('?logout=true');
  });

  function mapview() {
    return {
      mapButton: {
        appendChild: (node) => {
          appended = node;
        },
      },
    };
  }
});
