import { afterEach, describe, expect, it } from 'vitest';
import envReplace from '../../../mod/utils/envReplace.js';

describe('envReplace', () => {
  afterEach(() => {
    globalThis.xyzEnv = {};
  });

  it('replaces environment variables with their SRC_ values', () => {
    globalThis.xyzEnv = {
      SRC_HOST: 'example.com',
      SRC_PORT: '5432',
    };

    expect(envReplace('postgres://${HOST}:${PORT}/xyz')).toBe(
      'postgres://example.com:5432/xyz',
    );
  });

  it('leaves variables unchanged when no SRC_ value exists', () => {
    globalThis.xyzEnv = {};

    expect(envReplace('https://${HOST}/api')).toBe('https://${HOST}/api');
  });

  it('returns undefined when no string is provided', () => {
    expect(envReplace()).toBeUndefined();
  });
});
