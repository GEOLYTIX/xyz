import jwt from 'jsonwebtoken';
import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const secret = crypto.randomUUID();

globalThis.xyzEnv = {
  ...globalThis.xyzEnv,
  SECRET: secret,
  SECRET_ALGORITHM: 'HS256',
  TITLE: 'TEST',
};

// Mock acl to prevent PG connection
vi.mock('@geolytix/xyz-app/mod/user/acl.js', () => ({
  default: vi.fn(() => []),
}));

// Mock fromACL to prevent PG connection
vi.mock('@geolytix/xyz-app/mod/user/fromACL.js', () => ({
  default: vi.fn(),
}));

describe('token:', async () => {
  const { default: userToken } = await import('@geolytix/xyz-app/mod/user/token.js');

  const { default: auth } = await import('@geolytix/xyz-app/mod/user/auth.js');

  let token;

  let user = {
    email: 'test@geolytix.co.uk',
    roles: [],
    admin: true,
  };

  // The /user/token module should return an error if no user object is provided as request param.
  it('missing user param', async () => {
    const { req, res } = createMocks({
      params: {},
    });

    const response = await userToken(req, res);

    expect(
      response instanceof Error && response.message === 'login_required',
    ).toBeTruthy();
  });

  // The /user/token module should return a token for the provided user object request param.
  it('10hr admin user token', async () => {
    const { req, res } = createMocks({
      params: {
        expiresin: '10hr',
        user,
      },
    });

    await userToken(req, res);

    token = res._getData();

    user = jwt.verify(token, xyzEnv.SECRET);

    // token expires in 10hr.
    expect(user.exp - user.iat === 36000).toBeTruthy();

    // user from token must not have admin rights.
    expect(!user.admin).toBeTruthy();
  });

  // The /user/auth module should return the token user object without admin flag but with the from_token flag.
  it('token auth', async () => {
    const { req, res } = createMocks({
      params: {
        token,
      },
    });

    // auth should return user from token.
    user = await auth(req, res);

    expect(user.from_token).toBeTruthy();
  });

  // The user object from token authentication may not be used to create a new token.
  it('token user', async () => {
    const { req, res } = createMocks({
      params: {
        user,
      },
    });

    const response = await userToken(req, res);

    expect(
      response instanceof Error &&
        response.message ===
          'Token may not be generated from token authentication.',
    ).toBeTruthy();
  });
});
