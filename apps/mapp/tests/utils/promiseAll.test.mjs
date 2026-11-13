import { describe, expect, it, vi } from 'vitest';
import promiseAll from '../../lib/utils/promiseAll.mjs';

describe('utils/promiseAll', () => {
  it('is assigned to mapp.utils', () => {
    expect(mapp.utils.promiseAll).toBe(promiseAll);
  });

  it('resolves with the values of all promises in order', async () => {
    await expect(
      promiseAll([Promise.resolve(1), 2, Promise.resolve('three')]),
    ).resolves.toEqual([1, 2, 'three']);
  });

  it('logs and rejects with the first error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    const err = new Error('failed');

    await expect(
      promiseAll([Promise.resolve(1), Promise.reject(err)]),
    ).rejects.toBe(err);

    expect(error).toHaveBeenCalledWith(err);

    error.mockRestore();
  });
});
