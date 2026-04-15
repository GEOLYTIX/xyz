import { describe, expect, it, vi } from 'vitest';

const aclMockFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: (...args) => aclMockFn(...args),
}));

const mailerMockFn = vi.fn();
vi.mock('@geolytix/xyz-app/mod/utils/resend.js', () => ({
  default: { send: (...args) => mailerMockFn(...args) },
}));

describe('update: ', async () => {
  const { default: update } = await import('@geolytix/xyz-app/mod/user/update.js');

  it('should return error for non-admin users', async () => {
    aclMockFn.mockImplementation(function acl() {
      return [];
    });

    const req = {
      params: {
        user: { admin: false },
        email: 'test@example.com',
        host: 'test.com',
      },
      body: {},
    };

    const res = {
      status: (code) => ({ send: (message) => ({ code, message }) }),
      send: (message) => ({ message }),
    };

    const result = await update(req, res);

    expect(result instanceof Error).toBeTruthy();
    expect(result.message).toEqual('admin_user_login_required');
  });

  it('should send approval email', async () => {
    let mailOptions;

    mailerMockFn.mockImplementation(function mailer(options) {
      mailOptions = options;
      return true;
    });

    const req = {
      params: {
        user: { admin: true },
        email: 'test@example.com',
        host: 'test.com',
      },
      body: {
        email: 'test@example.com',
        approved: true,
        language: 'en',
      },
    };

    const res = {
      status: (code) => ({ send: (message) => ({ code, message }) }),
      send: (message) => ({ message }),
    };

    await update(req, res);

    expect(mailOptions).toEqual({
      template: 'approved_account',
      language: 'en',
      to: 'test@example.com',
      host: 'test.com',
    });
  });

  it('should reject invalid update keys', async () => {
    const req = {
      params: {
        user: { admin: true },
        email: 'test@example.com',
        host: 'test.com',
      },
      body: {
        email: 'test@example.com',
        'invalid;key': 'value',
      },
    };

    const res = {
      status: (code) => ({ send: (message) => ({ code, message }) }),
      send: (message) => ({ message }),
    };

    const result = await update(req, res);
    expect(result.code).toEqual(400);
    expect(result.message).toEqual(
      'Invalid key in user object for SQL update.',
    );
  });
});
