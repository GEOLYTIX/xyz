import { createMocks } from 'node-mocks-http';
import { MockAgent, setGlobalDispatcher } from 'undici';
import { describe, expect, it, vi } from 'vitest';

globalThis.xyzEnv = {};

const mockedCloudfrontFn = vi.fn();

vi.mock('../../../mod/sign/cloudfront.js', () => ({
  default: (...args) => mockedCloudfrontFn(...args),
}));

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

const { default: cloudfront } = await import(
  '../../../mod/provider/cloudfront.js'
);

describe('cloudfront:', () => {
  it('Should handle cloudfront signer error', async () => {
    mockedCloudfrontFn.mockImplementation(() => {
      return new Error('Cloudfront found an error');
    });

    const { req } = createMocks();

    const result = await cloudfront(req);

    expect(result).toBeInstanceOf(Error);
  });

  describe('Fetches signedURL', () => {
    const testCases = {
      error: {
        status: 300,
        body: 'test string',
        params: {
          url: 'http://localhost:3000/thing1.json',
          path: '/thing1.json',
        },
        expected: new Error(),
      },
      json: {
        status: 200,
        body: {
          objectKey: 'example-image.jpg',
          bucketName: 'my-aws-bucket',
          region: 'us-east-1',
          expires: '2023-12-31T23:59:59Z',
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'max-age=3600',
          },
        },
        params: {
          url: 'http://localhost:3000/proper.json',
          path: '/proper.json',
        },
        expected: {
          objectKey: 'example-image.jpg',
          bucketName: 'my-aws-bucket',
          region: 'us-east-1',
          expires: '2023-12-31T23:59:59Z',
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'max-age=3600',
          },
        },
      },
    };

    const mockPool = mockAgent.get(new RegExp('http://localhost:3000'));

    for (const test of Object.keys(testCases)) {
      it(`${test}`, async () => {
        mockedCloudfrontFn.mockImplementation(() => {
          return testCases[test].params.url;
        });

        const { req } = createMocks(
          {
            params: {
              url: testCases[test].params.url,
              body: testCases[test].body,
            },
          },
          {
            locals: {
              statusCode: testCases[test].status,
            },
          },
        );

        mockPool
          .intercept({ path: testCases[test].params.path })
          .reply(testCases[test].status, testCases[test].body);

        const results = await cloudfront(req);

        if (testCases[test].expected instanceof Error) {
          expect(results).toBeInstanceOf(Error);
        } else {
          expect(results).toEqual(testCases[test].expected);
        }
      });
    }
  });
});
