import { afterEach, describe, expect, it } from 'vitest';
import { versionCheck } from '../../lib/utils/versionCheck.mjs';

const version = mapp.version;

describe('utils/versionCheck', () => {
  afterEach(() => {
    mapp.version = version;
  });

  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.versionCheck).toBe(versionCheck);
  });

  it.each([
    ['4', true],
    ['4.99', true],
    ['5.0', true],
    ['5.0.99', true],
    ['5.1', true],
    ['5.1.0', true],
    ['5.1.3', true],
    ['5.1.4', false],
    ['5.2', false],
    ['6', false],
    ['6.0.0', false],
    [5.1, true],
  ])(
    'versionCheck(%s) with mapp.version 5.1.3 returns %s',
    (value, expected) => {
      mapp.version = '5.1.3';

      expect(versionCheck(value)).toBe(expected);
    },
  );

  it('compares the patch version', () => {
    mapp.version = '5.1.2';

    expect(versionCheck('5.1.2')).toBe(true);
    expect(versionCheck('5.1.3')).toBe(false);
  });
});
