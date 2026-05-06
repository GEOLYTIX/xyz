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
    if (ref.params?.url === 'object.json') return { test: true };
    if (ref.params?.url === 'plain.txt') return '<script>&';
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
    if (ref.params?.url === 'provider-error.txt') return new Error('failed');
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
    expect(result.message).toEqual('Failed to validate provider param.');
  });

  describe('Base Provider Tests', () => {
    const providers = ['file', 'cloudfront', 's3'];

    const expectedValues = {
      file: {
        data: 'Look at me go from the file provider fam!',
        content_type: 'application/text',
        headers: {
          'content-type': 'text/plain',
          'x-content-type-options': 'nosniff',
        },
      },
      cloudfront: {
        data: '{"test":{"another_test":{}}}',
        content_type: 'application/json',
        headers: {
          'content-type': 'application/json',
          'x-content-type-options': 'nosniff',
        },
      },
      s3: {
        data: 'http://localhost:3000/',
        content_type: 'application/text',
        headers: {
          'content-type': 'text/plain',
          'x-content-type-options': 'nosniff',
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

    it('serves JavaScript resources as a module MIME type', async () => {
      const { req, res } = createMocks({
        params: {
          provider: 'cloudfront',
          url: 'plugins/plugin.mjs',
        },
      });

      await provider(req, res);

      expect(res.getHeaders()).toEqual({
        'content-type': 'text/javascript',
        'x-content-type-options': 'nosniff',
      });
    });

    it('serves JavaScript resources with query strings as a module MIME type', async () => {
      const { req, res } = createMocks({
        params: {
          provider: 'cloudfront',
          content_type: 'text/plain',
          url: 'plugins/plugin.js?version=1',
        },
      });

      await provider(req, res);

      expect(res.getHeaders()).toEqual({
        'content-type': 'text/javascript',
        'x-content-type-options': 'nosniff',
      });
    });

    it('sends object provider responses as JSON', async () => {
      const { req, res } = createMocks({
        params: {
          provider: 'file',
          url: 'object.json',
        },
      });

      await provider(req, res);

      expect(res._getJSONData()).toEqual({ test: true });
      expect(res.getHeaders()).toEqual({
        'content-type': 'application/json',
        'x-content-type-options': 'nosniff',
      });
    });

    it('fails when the provider returns an error', async () => {
      const { req, res } = createMocks({
        params: {
          provider: 's3',
          url: 'provider-error.txt',
        },
      });

      await provider(req, res);

      expect(res.statusCode).toEqual(500);
      expect(res._getData()).toEqual('Provider request failed.');
      expect(res.getHeaders()).toEqual({
        'x-content-type-options': 'nosniff',
      });
    });

    it('does not serve arbitrary JavaScript content types', async () => {
      const { req, res } = createMocks({
        params: {
          provider: 'cloudfront',
          content_type: 'text/javascript',
          url: 'content/page.html',
        },
      });

      await provider(req, res);

      expect(res.getHeaders()).toEqual({
        'content-type': 'text/plain',
        'x-content-type-options': 'nosniff',
      });
    });

    it('sends plain text provider responses', async () => {
      const { req, res } = createMocks({
        params: {
          provider: 'file',
          content_type: 'text/plain',
          url: 'plain.txt',
        },
      });

      await provider(req, res);

      expect(res._getData()).toEqual('<script>&');
      expect(res.getHeaders()).toEqual({
        'content-type': 'text/plain',
        'x-content-type-options': 'nosniff',
      });
    });
  });
});
