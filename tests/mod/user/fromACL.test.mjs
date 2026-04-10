import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const mockCompareSyncFn = vi.fn();
vi.mock('bcrypt', () => ({
  bcrypt: {
    compareSync: (...args) => mockCompareSyncFn(...args),
  },
}));

const mockAclfn = vi.fn();
vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => mockAclfn(...args),
}));

const mockMailerFn = vi.fn();
vi.mock('../../../mod/utils/resend.js', () => ({
  default: (...args) => mockMailerFn(...args),
}));

const mockLanguageTempFn = vi.fn(async ({ language, template }) => {
  const templates = {
    missing_email: { fr: 'E-mail manquant' },
    missing_password: { fr: 'Mot de passe manquant' },
  };
  return templates[template]?.[language] || template;
});
vi.mock('../../../mod/utils/languageTemplates.js', () => ({
  default: (...args) => mockLanguageTempFn(...args),
}));

const mockReqHostFn = vi.fn();
vi.mock('../../../mod/utils/reqHost.js', () => ({
  default: (...args) => mockReqHostFn(...args),
}));

describe('acl', async () => {
  const { default: fromACL } = await import('../../../mod/user/fromACL.js');

  it('no email provided', async () => {
    const { req, res } = createMocks({
      body: {},
      params: {
        language: 'fr',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('E-mail manquant');
  });

  it('no password provided', async () => {
    const { req, res } = createMocks({
      body: { email: 'test@geolytix.com' },
      params: {
        language: 'fr',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('Mot de passe manquant');
  });
});
