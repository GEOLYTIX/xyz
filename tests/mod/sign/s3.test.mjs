const mockGetSignedUrlFn = codi.mock.fn();

const mockPreSigner = codi.mock.module('@aws-sdk/s3-request-presigner', {
  namedExports: {
    getSignedUrl: mockGetSignedUrlFn,
  },
});

const mockListObjectsV2Command = codi.mock.fn();
const mockGetObjectCommand = codi.mock.fn();
const mockPutObjectCommand = codi.mock.fn();
const mockDeleteObjectCommand = codi.mock.fn();

const mockClientSDK = codi.mock.module('@aws-sdk/client-s3', {
  namedExports: {
    S3Client: class s3Client {
      constructor(credentials) {
        this.credentials = credentials;
      }
    },
    ListObjectsV2Command: mockListObjectsV2Command,
    GetObjectCommand: mockGetObjectCommand,
    PutObjectCommand: mockPutObjectCommand,
    DeleteObjectCommand: mockDeleteObjectCommand,
  },
});

await codi.describe(
  { name: 's3:', id: 'sign_s3', parentId: 'sign' },
  async () => {
    await codi.it(
      { name: 'invalid command', parentId: 'sign_s3' },
      async () => {
        globalThis.xyzEnv = {
          AWS_S3_CLIENT: 'AWSS3KEY',
        };

        const { default: s3_signer } = await import('../../../mod/sign/s3.js');

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            command: 'foo',
          },
        });

        await s3_signer(req, res);

        codi.assertEqual(res.statusCode, 400);
        codi.assertEqual(
          res._getData(),
          'S3 clientSDK command validation failed.',
        );
      },
    );

    await codi.describe(
      {
        name: 'Commands: ',
        id: 'sign_s3_commands',
        parentId: 'sign_s3',
      },
      async () => {
        const commands = [
          'ListObjectsV2Command',
          'GetObjectCommand',
          'PutObjectCommand',
          'DeleteObjectCommand',
        ];

        const mockFns = {
          ListObjectsV2Command: {
            mockFn: mockListObjectsV2Command,
            url: 'https://aws.s3.test/list',
            implementation: class ListObjectsV2Command {
              constructor() {
                this.url = 'https://aws.s3.test/list';
              }
            },
          },
          GetObjectCommand: {
            mockFn: mockGetObjectCommand,
            url: 'https://aws.s3.test/get/test.json',
            implementation: class GetObjectCommand {
              constructor() {
                this.url = 'https://aws.s3.test/get/test.json';
              }
            },
          },
          PutObjectCommand: {
            mockFn: mockPutObjectCommand,
            url: 'https://aws.s3.test/put/test.json',
            implementation: class PutObjectCommand {
              constructor() {
                this.url = 'https://aws.s3.test/put/test.json';
              }
            },
          },
          DeleteObjectCommand: {
            mockFn: mockDeleteObjectCommand,
            url: 'https://aws.s3.test/delete/test.json',
            implementation: class DeleteObjectCommand {
              constructor() {
                this.url = 'https://aws.s3.test/delete/test.json';
              }
            },
          },
        };

        commands.forEach(async (command) => {
          await codi.it(
            { name: command, parentId: 'sign_s3_commands' },
            async () => {
              const mockFn = mockFns[command].mockFn;
              const url = mockFns[command].url;
              const implementation = mockFns[command].implementation;

              mockFn.mock.mockImplementation(implementation);

              mockGetSignedUrlFn.mock.mockImplementation(
                (S3Client, Command, opts) => {
                  const id = crypto.randomUUID();
                  return `${Command.url}?key=${id}`;
                },
              );

              const { default: s3_signer } = await import(
                '../../../mod/sign/s3.js'
              );

              const { req, res } = codi.mockHttp.createMocks({
                params: {
                  command: command,
                },
              });

              const result = await s3_signer(req, res);

              codi.assertTrue(result.includes(url));
            },
          );
        });
      },
    );
  },
);

mockClientSDK.restore();
mockPreSigner.restore();
