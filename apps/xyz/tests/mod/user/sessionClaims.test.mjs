import { describe, expect, it } from 'vitest';

describe('sessionClaims:', async () => {
  const { default: sessionClaims } = await import(
    '@geolytix/xyz-app/mod/user/sessionClaims.js'
  );

  it('defaults to typ session, iss xyz, and a single-value aud', () => {
    globalThis.xyzEnv = {
      SESSION_TYPE: 'session',
      SESSION_ISSUER: 'xyz',
      SESSION_AUDIENCE: 'xyz',
    };

    expect(sessionClaims()).toEqual({
      typ: 'session',
      iss: 'xyz',
      aud: ['xyz'],
    });
  });

  it('splits a comma-separated SESSION_AUDIENCE into multiple audiences', () => {
    globalThis.xyzEnv = {
      SESSION_TYPE: 'session',
      SESSION_ISSUER: 'xyz',
      SESSION_AUDIENCE: 'xyz,other-service',
    };

    expect(sessionClaims()).toEqual({
      typ: 'session',
      iss: 'xyz',
      aud: ['xyz', 'other-service'],
    });
  });
});
