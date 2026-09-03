import { beforeAll, describe, expect, it } from 'vitest';
import languageTemplates from '../../../mod/utils/languageTemplates.js';
import checkWorkspaceCache from '../../../mod/workspace/cache.js';

describe('languageTemplates', () => {
  beforeAll(async () => {
    globalThis.xyzEnv = {
      TITLE: 'LANGUAGE TEMPLATES TEST',
      WORKSPACE: 'file:./tests/assets/view.json',
    };

    await checkWorkspaceCache(true);
  });

  it('resolves a plain text msg template to its localised string', async () => {
    const result = await languageTemplates({
      language: 'en',
      template: 'user_not_verified',
    });

    // Plain _msgs.js templates have no src prefix. Without the provider
    // prefix check, getSrc() errors on the plain text and this falls back
    // to returning the template key itself, 'user_not_verified'.
    expect(result).toBe('User not verified or approved');
  });

  it('still resolves a src-backed template through the provider', async () => {
    // login_view is a core _views.js template with a 'file:' src prefix,
    // not overridden by the test workspace.
    globalThis.xyzEnv.XYZ_CWD = '../..';

    const result = await languageTemplates({
      language: 'en',
      template: 'login_view',
    });

    delete globalThis.xyzEnv.XYZ_CWD;

    expect(result).toContain('<html');
  });
});
