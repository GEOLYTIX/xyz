import { createMocks } from 'node-mocks-http';
import { describe, expect, it } from 'vitest';

const { default: cloudinary } = await import('@geolytix/xyz-app/mod/sign/cloudinary.js');

describe('cloudinary:', () => {
  it('no cloudinary url configured', async () => {
    globalThis.xyzEnv = {};

    const cloudinaryError = await cloudinary();

    expect(cloudinaryError).toBeInstanceOf(Error);
    expect(cloudinaryError.message).toEqual(
      'CLOUDINARY_URL not provided in xyzEnv',
    );
  });

  it('no folder provided', async () => {
    globalThis.xyzEnv = {
      CLOUDINARY_URL: 'https://cloudinary.test.com',
    };

    const { req, res } = createMocks({
      params: {},
    });

    const cloudinaryError = await cloudinary(req, res);

    expect(cloudinaryError).toBeInstanceOf(Error);

    expect(cloudinaryError.message).toEqual(
      'A folder request param is required for the cloudinary signer.',
    );
  });

  it('no public_id provided', async () => {
    globalThis.xyzEnv = {
      CLOUDINARY_URL: 'https://cloudinary.test.com',
    };

    const { req, res } = createMocks({
      params: {
        folder: './test',
      },
    });

    const cloudinaryError = await cloudinary(req, res);

    expect(cloudinaryError).toBeInstanceOf(Error);

    expect(cloudinaryError.message).toEqual(
      'A public_id request param is required for the cloudinary signer.',
    );
  });

  it('get url', async () => {
    const id1 = crypto.randomUUID();
    const id2 = crypto.randomUUID();

    globalThis.xyzEnv = {
      CLOUDINARY_URL: `cloudinary://${id1}:${id2}@test`,
    };

    const { req, res } = createMocks({
      params: {
        folder: './test',
        public_id: 'public_id',
      },
    });

    const cloudinaryURL = await cloudinary(req, res);

    expect(cloudinaryURL.includes(id1)).toBeTruthy();
    expect(cloudinaryURL.includes(id2)).toBeTruthy();
    expect(
      cloudinaryURL.includes('https://api.cloudinary.com/v1_1/'),
    ).toBeTruthy();
    expect(cloudinaryURL.includes('upload')).toBeTruthy();
  });
});
