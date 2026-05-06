import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../mod/provider/cloudfront.js', () => ({
  default: null,
}));

vi.mock('../../../mod/provider/file.js', () => ({
  default: vi.fn(),
}));

vi.mock('../../../mod/provider/s3.js', () => ({
  default: vi.fn(),
}));

const { default: provider } = await import(
  '../../../mod/provider/_provider.js'
);

describe('Provider configuration:', () => {
  it('fails when a provider is not configured', async () => {
    const req = {
      params: {
        provider: 'cloudfront',
      },
    };

    const res = {
      status: (code) => ({ send: (message) => ({ code, message }) }),
    };

    const result = await provider(req, res);

    expect(result.code).toEqual(405);
    expect(result.message).toEqual('Provider is not configured.');
  });
});
