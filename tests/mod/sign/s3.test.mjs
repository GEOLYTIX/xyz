import { createMocks } from 'node-mocks-http';
import { describe, expect, it, vi } from 'vitest';

const mockGetSignedUrlFn = vi.fn();

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: (...args) => mockGetSignedUrlFn(...args),
}));

vi.mock('@aws-sdk/client-s3', () => ({
  S3Client: function s3Client(credentials) {
    this.credentials = credentials;
  },
  ListObjectsV2Command: function ListObjectsV2Command() {
    this.url = 'https://aws.s3.test/list';
  },
  GetObjectCommand: function GetObjectCommand() {
    this.url = 'https://aws.s3.test/get/test.json';
  },
  PutObjectCommand: function PutObjectCommand() {
    this.url = 'https://aws.s3.test/put/test.json';
  },
  DeleteObjectCommand: function DeleteObjectCommand() {
    this.url = 'https://aws.s3.test/delete/test.json';
  },
}));

describe('s3:', () => {
  it('invalid command', async () => {
    globalThis.xyzEnv = {
      AWS_S3_CLIENT: 'AWSS3KEY',
    };

    const { default: s3_signer } = await import('../../../mod/sign/s3.js');

    const { req, res } = createMocks({
      params: {
        command: 'foo',
      },
    });

    const resp = await s3_signer(req, res);

    expect(resp).toBeInstanceOf(Error);
    expect(resp.toString()).toEqual(
      'Error: S3 clientSDK command validation failed.',
    );
  });

  describe('Commands:', () => {
    const commands = [
      {
        name: 'ListObjectsV2Command',
        url: 'https://aws.s3.test/list',
      },
      {
        name: 'GetObjectCommand',
        url: 'https://aws.s3.test/get/test.json',
      },
      {
        name: 'PutObjectCommand',
        url: 'https://aws.s3.test/put/test.json',
      },
      {
        name: 'DeleteObjectCommand',
        url: 'https://aws.s3.test/delete/test.json',
      },
    ];

    for (const command of commands) {
      it(command.name, async () => {
        mockGetSignedUrlFn.mockImplementation((S3Client, Command, opts) => {
          const id = crypto.randomUUID();
          return `${Command.url}?key=${id}`;
        });

        const { default: s3_signer } = await import('../../../mod/sign/s3.js');

        const { req, res } = createMocks({
          params: {
            command: command.name,
          },
        });

        const result = await s3_signer(req, res);

        expect(result).toContain(command.url);
      });
    }
  });
});
