import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

import 'dotenv/config';
import '@geolytix/xyz-app/mod/utils/processEnv.js';

vi.mock('@geolytix/xyz-app/mod/sign/file.js', () => ({
  default: vi.fn(),
  file_signer: vi.fn(),
}));

vi.mock('@geolytix/xyz-app/mod/provider/file.js', () => ({
  default: (ref) => {
    ref = '';
    return String('Look at me go from the file provider fam!');
  },
}));

vi.mock('@geolytix/xyz-app/mod/provider/cloudfront.js', () => ({
  default: (ref) => {
    ref = '';
    return '{"test":{"another_test":{}}}';
  },
}));

vi.mock('@geolytix/xyz-app/mod/provider/s3.js', () => ({
  default: (ref) => {
    ref = '';
    return 'http://localhost:3000/';
  },
}));

const { default: provider } = await import(
  '@geolytix/xyz-app/mod/provider/_provider.js'
);

describe('Provider:', () => {
  it('Bogus provider test', async () => {
    const req = {
      params: {
        provider: 'mongo',
      },
    };

    const res = {
      status: (code) => ({ send: (message) => ({ code, message }) }),
      send: (message) => ({ message }),
    };

    const result = await provider(req, res);

    expect(result.code).toEqual(404);
    expect(result.message).toEqual(
      "Failed to validate 'provider=mongo' param.",
    );
  });

  describe('Base Provider Tests', () => {
    const providers = ['file', 'cloudfront', 's3'];

    const expectedValues = {
      file: {
        data: 'Look at me go from the file provider fam!',
        content_type: 'application/text',
        headers: {
          'content-type': 'application/text',
        },
      },
      cloudfront: {
        data: '{"test":{"another_test":{}}}',
        content_type: 'application/json',
        headers: {
          'content-type': 'application/json',
        },
      },
      s3: {
        data: 'http://localhost:3000/',
        content_type: 'application/text',
        headers: {
          'content-type': 'application/text',
        },
      },
    };

    for (const providerName of providers) {
      it(`${providerName}`, async () => {
        const { req, res } = createMocks({
          params: {
            provider: providerName,
            content_type: expectedValues[providerName].content_type,
          },
        });

        await provider(req, res);

        const data = res._getData();
        const headers = res.getHeaders();

        expect(data).toEqual(expectedValues[providerName].data);
        expect(headers).toEqual(expectedValues[providerName].headers);
      });
    }
  });
});
