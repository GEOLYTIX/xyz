import { describe, expect, it, vi } from 'vitest';

vi.mock('fs', () => ({
  readFileSync: () => {
    return 'PRIVATEKEY';
  },
}));

const mockGetSignedURLFn = vi.fn();

vi.mock('@aws-sdk/cloudfront-signer', () => ({
  getSignedUrl: (...args) => mockGetSignedURLFn(...args),
}));

globalThis.xyzEnv = {
  SRC_TEST: 'test.com',
  KEY_CLOUDFRONT: 'IAMACLOUDFRONTKEY',
};

const { default: cloudfront_signer } = await import(
  '../../../mod/sign/cloudfront.js'
);

describe('cloudfront:', () => {
  it('get url', async () => {
    const id = crypto.randomUUID();

    mockGetSignedURLFn.mockImplementation((cloudfront) => {
      return cloudfront.url + '?key=' + id;
    });

    const req_url = '{TEST}/cool.json';

    const signedUrl = await cloudfront_signer(req_url);

    expect(signedUrl).toEqual(`https://test.com/cool.json?key=${id}`);
  });
});
