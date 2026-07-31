/**
## /tests/lib/utils/versionCheck

@module /tests/lib/utils/versionCheck
*/

import { afterEach, beforeAll, describe, expect, it } from 'vitest';

describe('utils/versionCheck', () => {
  let version;

  beforeAll(() => {
    version = mapp.version;
  });

  afterEach(() => {
    // versionCheck reads the version off the shared mapp global.
    mapp.version = version;
  });

  it('passes when the patch exceeds the required version', () => {
    mapp.version = '4.11.1';

    expect(mapp.utils.versionCheck('4.11')).toBe(true);
  });

  it('passes when the major version is ahead', () => {
    mapp.version = '4.9.1';

    expect(mapp.utils.versionCheck('3.9')).toBe(true);
  });

  it('fails when the minor version is behind', () => {
    mapp.version = '4.9.0';

    expect(mapp.utils.versionCheck('4.10.0')).toBe(false);
  });

  it('passes when the minor version is ahead', () => {
    mapp.version = '4.11.0';

    expect(mapp.utils.versionCheck('4.10.0')).toBe(true);
  });

  it('passes when major and minor match and the patch is ahead', () => {
    mapp.version = '4.11.2';

    expect(mapp.utils.versionCheck('4.11.1')).toBe(true);
  });
});
