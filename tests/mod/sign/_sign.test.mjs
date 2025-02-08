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

codi.describe({ name: 'Sign: ', id: 'sign' }, () => {
  codi.it({ name: 'Invalid signer', parentId: 'sign' }, async () => {
    const { default: signer } = await import('../../../mod/sign/_sign.js');

    const { req, res } = codi.mockHttp.createMocks({
      params: {
        signer: 'foo',
      },
    });

    await signer(req, res);

    codi.assertEqual(res.statusCode, 404);
    codi.assertEqual(res._getData(), "Failed to validate 'signer=foo' param.");
  });
});

mockCloudFront.restore();
mockCloudinary.restore();
mocks3.restore();
