import http from 'node:http';
import express from 'express';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

// Regression test for a router.js bug where the public /api/user/verify route
// was missing the {/:key} path segment. Verify links always carry the
// verification token in the path (register.js: `${host}/api/user/verify/${token}`),
// so the un-keyed route never matched and every real verify click fell through
// to the generic, auth-gated /api/user{/:method}{/:key} route instead -
// silently redirecting an unauthenticated visitor to the login screen.

const verifyFn = vi.fn((req, res) => {
  res.status(200).send(`verify:${req.params.key ?? ''}`);
});

vi.mock('@geolytix/xyz-app/mod/user/verify.js', () => ({
  default: (...args) => verifyFn(...args),
}));

// Simulate an unauthenticated visitor regardless of the real auth/ACL wiring.
vi.mock('@geolytix/xyz-app/mod/user/auth.js', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

globalThis.xyzEnv = {
  DIR: '/latest',
  TITLE: 'TEST_APP',
  // A PRIVATE instance is what makes validateRequestAuth redirect
  // unauthenticated requests to the login screen.
  PRIVATE: 'postgres://user:pass@localhost:5432/db|acl_schema.acl_table',
  COOKIE_PROPS: 'Path=/latest',
  RATE_LIMIT: 1000,
  RATE_LIMIT_WINDOW: 60000,
};

const { default: validateRequestParams } = await import(
  '@geolytix/xyz-app/mod/middleware/validateRequestParams.js'
);
const { default: validateRequestAuth } = await import(
  '@geolytix/xyz-app/mod/middleware/validateRequestAuth.js'
);
const { default: createRouter } = await import('@geolytix/xyz-app/router');

describe('router: /api/user/verify', () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const app = express();
    app.use(createRouter([validateRequestParams, validateRequestAuth]));

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    baseUrl = `http://localhost:${server.address().port}`;
  });

  afterAll(() => {
    server.close();
  });

  it('routes an unauthenticated verify link with a token to the verify handler, not the login redirect', async () => {
    verifyFn.mockClear();

    const res = await fetch(`${baseUrl}/latest/api/user/verify/some-token`, {
      redirect: 'manual',
    });

    expect(res.headers.get('location')).not.toBe('/latest/api/user/login');
    expect(res.status).not.toBe(302);
    expect(verifyFn).toHaveBeenCalledTimes(1);
    expect(await res.text()).toBe('verify:some-token');
  });

  it('still routes a bare verify request with no token to the verify handler', async () => {
    verifyFn.mockClear();

    const res = await fetch(`${baseUrl}/latest/api/user/verify`, {
      redirect: 'manual',
    });

    expect(res.status).not.toBe(302);
    expect(verifyFn).toHaveBeenCalledTimes(1);
  });
});
