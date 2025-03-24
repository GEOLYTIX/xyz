const mockCloudFrontFn = codi.mock.fn();
const mockCloudFront = codi.mock.module('../../../mod/sign/cloudfront.js', {
  defaultExport: mockCloudFrontFn,
});

const mockCloudinaryFn = codi.mock.fn();
const mockCloudinary = codi.mock.module('../../../mod/sign/cloudinary.js', {
  defaultExport: mockCloudinaryFn,
});

const mocks3Fn = codi.mock.fn();
const mocks3 = codi.mock.module('../../../mod/sign/s3.js', {
  defaultExport: mocks3Fn,
});

await codi.describe({ name: 'Sign: ', id: 'sign' }, async () => {
  const { default: signer } = await import('../../../mod/sign/_sign.js');
  await codi.it({ name: 'Invalid signer', parentId: 'sign' }, async () => {
    const { req, res } = codi.mockHttp.createMocks({
      params: {
        signer: 'foo',
      },
    });

    await signer(req, res);

    codi.assertEqual(res.statusCode, 404);
    codi.assertEqual(res._getData(), "Failed to validate 'signer=foo' param.");
  });

  await codi.it({ name: 'response Error', parentId: 'sign' }, async () => {
    const { req, res } = codi.mockHttp.createMocks({
      params: {
        signer: 's3',
      },
    });

    mocks3Fn.mock.mockImplementation(() => {
      return new Error('This is not happening');
    });

    await signer(req, res);

    codi.assertEqual(res.statusCode, 500);
    codi.assertEqual(res._getData(), 'This is not happening');
  });

  await codi.describe(
    { name: 'signers: ', id: 'sign_signers', parentId: 'sign' },
    () => {
      const signers = ['s3', 'cloudfront', 'cloudinary'];

      const mockFns = {
        s3: mocks3Fn,
        cloudinary: mockCloudinaryFn,
        cloudfront: mockCloudFrontFn,
      };

      signers.forEach(async (sign) => {
        await codi.it(
          { name: `${sign}`, parentId: 'sign_signers' },
          async () => {
            const mockFn = mockFns[sign];

            mockFn.mock.mockImplementation(() => {
              return `I am a file coming from ${sign}`;
            });

            const { req, res } = codi.mockHttp.createMocks({
              params: {
                signer: sign,
              },
            });

            await signer(req, res);

            const body = res._getData();

            codi.assertEqual(body, `I am a file coming from ${sign}`);
          },
        );
      });
    },
  );
});

mockCloudFront.restore();
mockCloudinary.restore();
mocks3.restore();
