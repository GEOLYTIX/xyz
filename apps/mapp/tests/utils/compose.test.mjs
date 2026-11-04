import { describe, expect, it } from 'vitest';
import compose from '../../lib/utils/compose.mjs';

describe('utils/compose', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.compose).toBe(compose);
  });

  it('passes the argument left to right through the functions', () => {
    const fn = compose(
      (x) => x + 1,
      (x) => x * 2,
      (x) => `${x}!`,
    );

    expect(fn(3)).toBe('8!');
  });

  it('returns the argument without functions', () => {
    const arg = { key: 'value' };

    expect(compose()(arg)).toBe(arg);
  });

  it('composes a bound method into itself', async () => {
    const calls = [];

    const decorate = async (layer) => ({ ...layer, decorated: true });

    const composed = compose(decorate.bind(), async (layer) => {
      const decorated = await layer;
      calls.push(decorated.key);
      return decorated;
    });

    await expect(composed({ key: 'layer' })).resolves.toEqual({
      key: 'layer',
      decorated: true,
    });

    expect(calls).toEqual(['layer']);
  });
});
