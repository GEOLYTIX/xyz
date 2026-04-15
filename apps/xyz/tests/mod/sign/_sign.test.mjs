import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const mockCloudFrontFn = vi.fn();
const mockCloudinaryFn = vi.fn();
const mocks3Fn = vi.fn();
const mockFileFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/sign/cloudfront.js', () => ({
  default: (...args) => mockCloudFrontFn(...args),
}));

vi.mock('@geolytix/xyz-app/mod/sign/cloudinary.js', () => ({
  default: (...args) => mockCloudinaryFn(...args),
}));

vi.mock('@geolytix/xyz-app/mod/sign/s3.js', () => ({
  default: (...args) => mocks3Fn(...args),
}));

vi.mock('@geolytix/xyz-app/mod/sign/file.js', () => ({
  default: (...args) => mockFileFn(...args),
}));

const { default: signer } = await import('@geolytix/xyz-app/mod/sign/_sign.js');

describe('Sign:', () => {
  it('Invalid signer', async () => {
    const { req, res } = createMocks({
      params: {
        signer: 'foo',
      },
    });

    await signer(req, res);

    expect(res.statusCode).toEqual(404);
    expect(res._getData()).toEqual("Failed to validate 'signer=foo' param.");
  });

  it('response Error', async () => {
    const { req, res } = createMocks({
      params: {
        signer: 's3',
      },
    });

    mocks3Fn.mockImplementation(() => {
      return new Error('This is not happening');
    });

    await signer(req, res);

    expect(res.statusCode).toEqual(500);
    expect(res._getData()).toEqual('This is not happening');
  });

  describe('signers:', () => {
    const signers = ['s3', 'cloudfront', 'cloudinary', 'file'];

    const mockFns = {
      s3: mocks3Fn,
      cloudinary: mockCloudinaryFn,
      cloudfront: mockCloudFrontFn,
      file: mockFileFn,
    };

    for (const sign of signers) {
      it(`${sign}`, async () => {
        const mockFn = mockFns[sign];

        mockFn.mockImplementation(() => {
          return `I am a file coming from ${sign}`;
        });

        const { req, res } = createMocks({
          params: {
            signer: sign,
          },
        });

        await signer(req, res);

        const body = res._getData();

        expect(body).toEqual(`I am a file coming from ${sign}`);
      });
    }
  });
});
