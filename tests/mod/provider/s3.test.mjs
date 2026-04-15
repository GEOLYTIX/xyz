import { describe, expect, it, vi } from 'vitest';

const mocks3SignerFn = vi.fn();

vi.mock('../../../mod/sign/s3.js', () => ({
  default: (...args) => mocks3SignerFn(...args),
}));

const { default: s3_provider } = await import('../../../mod/provider/s3.js');

describe('s3:', () => {
  it('get from signer', async () => {
    const fileBody = JSON.stringify(
      '{ "templates": {}, "locale": { "layers": {}, }, }',
    );

    mocks3SignerFn.mockImplementation(async () => {
      return fileBody;
    });

    const result = await s3_provider();

    expect(result).toEqual(fileBody);
  });
});
