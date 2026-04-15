import { createMocks } from 'node-mocks-http';
import { describe, expect, it } from 'vitest';

const { default: admin } = await import('@geolytix/xyz-app/mod/user/admin.js');

describe('admin:', () => {
  it('no user provided', async () => {
    const { req, res } = createMocks();

    const result = await admin(req, res);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toEqual('login_required');
  });

  it('not an admin user', async () => {
    const { req, res } = createMocks({
      params: {
        user: {},
      },
    });

    const result = await admin(req, res);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toEqual('admin_required');
  });
});
