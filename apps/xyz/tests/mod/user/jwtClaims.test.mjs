import { describe, expect, it } from 'vitest';

describe('jwtClaims:', async () => {
  const { default: jwtClaims } = await import(
    '@geolytix/xyz-app/mod/user/jwtClaims.js'
  );

  it('defaults to typ session, iss xyz, and a single-value aud', () => {
    globalThis.xyzEnv = {
      JWT_TYPE: 'session',
      JWT_ISSUER: 'xyz',
      JWT_AUDIENCE: 'xyz',
    };

    expect(jwtClaims()).toEqual({
      typ: 'session',
      iss: 'xyz',
      aud: ['xyz'],
    });
  });

  it('splits a comma-separated JWT_AUDIENCE into multiple audiences', () => {
    globalThis.xyzEnv = {
      JWT_TYPE: 'session',
      JWT_ISSUER: 'xyz',
      JWT_AUDIENCE: 'xyz,other-service',
    };

    expect(jwtClaims()).toEqual({
      typ: 'session',
      iss: 'xyz',
      aud: ['xyz', 'other-service'],
    });
  });
});
