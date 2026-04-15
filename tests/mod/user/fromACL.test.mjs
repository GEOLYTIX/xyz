import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const mockCompareSyncFn = vi.fn((req_pass, user_pass) => {
  return req_pass.includes('fail') ? false : true;
});

vi.mock('bcrypt', () => ({
  //bcrypt: {
  compareSync: (...args) => {
    return mockCompareSyncFn(...args);
  },
  //},
}));

const mockAclfn = (query, email) => {
  email = email[0];
  const data = {
    blocked: email.includes('blocked'),
    password: 'dummy',
    language: 'en',
    approved: !email.includes('notapproved'),
    verified: !email.includes('notverified'),
    expires_on: email.includes('expired') ? 315532800 : null,
    failedattempts: email.includes('exceeded') ? 10 : 0,
  };

  if (
    email.includes('error') ||
    (query.includes('session = ') && email.includes('session')) ||
    (query.includes('failedattempts') && email.includes('fail')) ||
    (query.includes('verified = false') && email.includes('unverify'))
  )
    return new Error();

  if (email.includes('notfound')) return [];
  if (email.includes('nopassword')) return [{}];
  if (email.includes('equal')) data.failedattempts = 3;

  return [data];
};

vi.mock('../../../mod/user/acl.js', () => ({
  default: (...args) => {
    return mockAclfn(...args);
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

  it('failed to get user', async () => {
    const { req, res } = createMocks({
      body: { email: 'error@geolytix.com', password: 'thisisadummypassword' },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('Failed to query PostGIS table');
  });

  it('user not found', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'notfound@geolytix.com',
        password: 'thisisadummypassword',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('auth_failed');
  });

  it('user has no password', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'nopassword@geolytix.com',
        password: 'thisisadummypassword',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('auth_failed');
  });

  it('user account expired', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'expired@geolytix.com',
        password: 'thisisadummypassword',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    globalThis.xyzEnv.APPROVAL_EXPIRY = true;
    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('User Expired');

    globalThis.xyzEnv.APPROVAL_EXPIRY = false;
  });

  it('user is blocked', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'blocked@geolytix.com',
        password: 'thisisadummypassword',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('User Blocked');
  });

  it('user is not approved/verified', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'notapproved@geolytix.com',
        password: 'thisisadummypassword',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('user_not_verified');
  });

  it('user session storage fails', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'session@geolytix.co.uk',
        password: 'dummy',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    globalThis.xyzEnv.USER_SESSION = true;
    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('Unable to store session.');

    globalThis.xyzEnv.USER_SESSION = false;
  });

  it('user login failed query', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'fail@geolytix.co.uk',
        password: 'fail',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('Failed to query PostGIS table');
  });

  it('exceeded max attempts', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'exceeded@geolytix.co.uk',
        password: 'fail',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('auth_failed');
  });

  it('incorrect login fail', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'send@geolytix.co.uk',
        password: 'fail',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('auth_failed');
  });

  it('mark user unverified query failed', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'unverify@geolytix.co.uk',
        password: 'fail',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('auth_failed');
  });

  it('login fail max attempts reached', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'equal@geolytix.co.uk',
        password: 'fail',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

    const result = await fromACL(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('Max login attempts reached');
  });

  it('user succesfully retrieved', async () => {
    const { req, res } = createMocks({
      body: {
        email: 'test@geolytix.co.uk',
        password: 'dummy',
      },
      params: {
        language: 'en',
      },
      headers: {
        host: 'localhost:3000',
      },
    });

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
