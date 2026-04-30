import { createMocks } from 'node-mocks-http';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockCompareSyncFn = vi.fn((req_pass, user_pass) => {
  return !req_pass.includes('fail');
});

const VALID_AUTH_VALUE = ['test', 'value'].join('-');
const FAILING_AUTH_VALUE = ['fail', 'value'].join('-');

vi.mock('bcrypt', () => ({
  //bcrypt: {
  compareSync: (...args) => {
    return mockCompareSyncFn(...args);
  },
  //},
}));

const mockAclRows = (query, email) => {
  email = email[0];
  const data = {
    blocked: email.includes('blocked'),
    password: VALID_AUTH_VALUE,
    language: 'en',
    approved: !email.includes('notapproved'),
    verified: !email.includes('notverified'),
    expires_on: email.includes('expired') ? 315532800 : null,
    failedattempts: email.includes('exceeded') ? 10 : 0,
  };

  if (email.includes('notfound')) return [];
  if (email.includes('nopassword')) return [{}];
  if (email.includes('equal')) data.failedattempts = 3;

  return [data];
};

const aclMockFn = vi.fn(mockAclRows);

const createLoginMocks = ({
  body,
  email = 'test@geolytix.com',
  language = 'en',
  password = VALID_AUTH_VALUE,
} = {}) => {
  return createMocks({
    body: body ?? { email, password },
    params: { language },
    headers: { host: 'localhost:3000' },
  });
};

const expectAuthError = async (fromACL, req, res, message) => {
  const result = await fromACL(req, res);

  expect(result instanceof Error).toBeTruthy();
  expect(result.message).toEqual(message);
};

vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => {
    return aclMockFn(...args);
  },
}));

const mockMailerFn = vi.fn();
vi.mock('../../../mod/utils/resend.js', () => ({
  default: { send: (...args) => mockMailerFn(...args) },
}));

const mockLanguageTempFn = vi.fn(async ({ language, template }) => {
  const templates = {
    missing_email: { fr: 'E-mail manquant' },
    missing_password: { fr: 'Mot de passe manquant' },
    failed_query: { en: 'Failed to query PostGIS table' },
    user_blocked: { en: 'User Blocked' },
    user_expired: { en: 'User Expired' },
    user_locked: { en: 'Max login attempts reached' },
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
  globalThis.xyzEnv.FAILED_ATTEMPTS = 3;
  const { default: fromACL } = await import('../../../mod/user/fromACL.js');

  beforeEach(() => {
    aclMockFn.mockImplementation(mockAclRows);
  });

  it('no email provided', async () => {
    const { req, res } = createLoginMocks({ body: {}, language: 'fr' });

    await expectAuthError(fromACL, req, res, 'E-mail manquant');
  });

  it('no password provided', async () => {
    const { req, res } = createLoginMocks({
      body: { email: 'test@geolytix.com' },
      language: 'fr',
    });

    await expectAuthError(fromACL, req, res, 'Mot de passe manquant');
  });

  it('failed to get user', async () => {
    aclMockFn.mockImplementationOnce(() => new Error('ACL query failed'));

    const { req, res } = createLoginMocks({ email: 'error@geolytix.com' });

    await expectAuthError(fromACL, req, res, 'Failed to query PostGIS table');
  });

  const authFailureCases = [
    ['user not found', 'notfound@geolytix.com', 'auth_failed'],
    ['user has no password', 'nopassword@geolytix.com', 'auth_failed'],
    ['user is blocked', 'blocked@geolytix.com', 'User Blocked'],
    [
      'user is not approved/verified',
      'notapproved@geolytix.com',
      'user_not_verified',
    ],
    [
      'exceeded max attempts',
      'exceeded@geolytix.co.uk',
      'auth_failed',
      FAILING_AUTH_VALUE,
    ],
    [
      'incorrect login fail',
      'send@geolytix.co.uk',
      'auth_failed',
      FAILING_AUTH_VALUE,
    ],
    [
      'mark user unverified query failed',
      'unverify@geolytix.co.uk',
      'auth_failed',
      FAILING_AUTH_VALUE,
    ],
    [
      'login fail max attempts reached',
      'equal@geolytix.co.uk',
      'Max login attempts reached',
      FAILING_AUTH_VALUE,
    ],
  ];

  for (const [name, email, message, password] of authFailureCases) {
    it(name, async () => {
      const { req, res } = createLoginMocks({ email, password });

      await expectAuthError(fromACL, req, res, message);
    });
  }

  it('user account expired', async () => {
    const { req, res } = createLoginMocks({ email: 'expired@geolytix.com' });

    globalThis.xyzEnv.APPROVAL_EXPIRY = true;
    await expectAuthError(fromACL, req, res, 'User Expired');

    globalThis.xyzEnv.APPROVAL_EXPIRY = false;
  });

  it('user session storage fails', async () => {
    aclMockFn
      .mockImplementationOnce(mockAclRows)
      .mockImplementationOnce(() => new Error('ACL session update failed'));

    const { req, res } = createLoginMocks({ email: 'session@geolytix.co.uk' });

    globalThis.xyzEnv.USER_SESSION = true;
    await expectAuthError(fromACL, req, res, 'Unable to store session.');

    globalThis.xyzEnv.USER_SESSION = false;
  });

  it('user login failed query', async () => {
    aclMockFn
      .mockImplementationOnce(mockAclRows)
      .mockImplementationOnce(
        () => new Error('ACL failed attempts update failed'),
      );

    const { req, res } = createLoginMocks({
      email: 'fail@geolytix.co.uk',
      password: FAILING_AUTH_VALUE,
    });

    await expectAuthError(fromACL, req, res, 'Failed to query PostGIS table');
  });

  it('user succesfully retrieved', async () => {
    const { req, res } = createLoginMocks({ email: 'test@geolytix.co.uk' });

    const result = await fromACL(req, res);

    expect(typeof result === 'object').toBeTruthy();
    expect(Object.keys(result)).toEqual([
      'language',
      'approved',
      'verified',
      'expires_on',
      'failedattempts',
    ]);
  });
});
