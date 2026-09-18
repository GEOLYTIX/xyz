import { describe, expect, it } from 'vitest';

describe('sessionClaims:', async () => {
  const { default: sessionClaims } = await import(
    '@geolytix/xyz-app/mod/user/sessionClaims.js'
  );

  it('defaults to typ session, iss xyz, and a single-value aud', () => {
    globalThis.xyzEnv = {
      SESSION_TYP: 'session',
      SESSION_ISS: 'xyz',
      SESSION_AUD: 'xyz',
    };

    expect(sessionClaims()).toEqual({
      typ: 'session',
      iss: 'xyz',
      aud: ['xyz'],
    });
  });

  it('splits a comma-separated SESSION_AUD into multiple audiences', () => {
    globalThis.xyzEnv = {
      SESSION_TYP: 'session',
      SESSION_ISS: 'xyz',
      SESSION_AUD: 'xyz,other-service',
    };

    expect(sessionClaims()).toEqual({
      typ: 'session',
      iss: 'xyz',
      aud: ['xyz', 'other-service'],
    });
  });
});
