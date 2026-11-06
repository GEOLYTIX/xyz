import { describe, expect, it } from 'vitest';
import mobile from '../../lib/utils/mobile.mjs';

describe('utils/mobile', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.mobile).toBe(mobile);
  });

  it('returns false before a width is set', () => {
    expect(mobile()).toBe(false);
  });

  it('compares the window.innerWidth with the set width', () => {
    expect(mobile(window.innerWidth - 1)).toBeUndefined();
    expect(mobile()).toBe(false);

    mobile(window.innerWidth);
    expect(mobile()).toBe(true);

    mobile(window.innerWidth + 100);
    expect(mobile()).toBe(true);
  });
});
