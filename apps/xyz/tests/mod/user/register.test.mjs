import { createMocks } from 'node-mocks-http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

globalThis.xyzEnv = {
  PRIVATE: '192.168.1.1:3000|user:password|acl.test',
};

const originalWarn = console.warn;
const mockWarn = [];

beforeAll(() => {
  console.warn = (log) => {
    mockWarn.push(log);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});

const mockMailerFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/utils/resend.js', () => ({
  default: { send: (...args) => mockMailerFn(...args) },
}));

const mockAclFn = vi.fn(() => []);
vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => mockAclFn(...args),
}));

describe('register: ', async () => {
  const { default: register } = await import(
    '@geolytix/xyz-app/mod/user/register.js'
  );

  it('USER_DOMAINS - full domain with invalid email', async () => {
    globalThis.xyzEnv.USER_DOMAINS = 'geolytix.com';

    const { req, res } = createMocks({
      headers: {
        host: 'localhost',
      },
      body: {
        email: 'dev_1@geolytix.co.uk',
        password: 'ValidPass123!',
        language: 'en',
      },
    });

    await register(req, res);
    expect(res.statusCode === 400).toBeTruthy();
    expect(res._getData()).toEqual('Provided email address is invalid');
  });

  it('USER_DOMAINS - short domain with invalid email', async () => {
    globalThis.xyzEnv.USER_DOMAINS = 'geolytix';

    const { req, res } = createMocks({
      headers: {
        host: 'localhost',
      },
      body: {
        email: 'dev_1@test.co.uk',
        password: 'ValidPass123!',
        language: 'en',
      },
    });

    await register(req, res);
    expect(res.statusCode === 400).toBeTruthy();
    expect(res._getData()).toEqual('Provided email address is invalid');
  });

  it('USER_DOMAINS - full domain with valid email', async () => {
    globalThis.xyzEnv.USER_DOMAINS = 'geolytix.com';

    const { req, res } = createMocks({
      headers: {
        host: 'localhost',
      },
      body: {
        email: 'dev_1@geolytix.com',
        password: 'ValidPass123!',
        language: 'en',
      },
    });

    await register(req, res);
    expect(res.statusCode === 200).toBeTruthy();
  });

  it('USER_DOMAINS - short domain with valid email', async () => {
    globalThis.xyzEnv.USER_DOMAINS = 'geolytix';

    const { req, res } = createMocks({
      headers: {
        host: 'localhost',
      },
      body: {
        email: 'dev_1@geolytix.whatever',
        password: 'ValidPass123!',
        language: 'en',
      },
    });

    await register(req, res);
    expect(res.statusCode === 200).toBeTruthy();
  });

  it('USER_DOMAINS - ensure case insensitivity', async () => {
    globalThis.xyzEnv.USER_DOMAINS = 'geolytix';

    const { req, res } = createMocks({
      headers: {
        host: 'localhost',
      },
      body: {
        email: 'dev_1@GEOLYTIX.COM',
        password: 'ValidPass123!',
        language: 'en',
      },
    });

    await register(req, res);
    expect(res.statusCode === 200).toBeTruthy();
  });
});
