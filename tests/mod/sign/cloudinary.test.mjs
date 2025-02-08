await codi.describe(
  { name: 'cloudinary:', id: 'sign_cloudinary', parentId: 'sign' },
  async () => {
    await codi.it(
      { name: 'no cloudinary url configured', parentId: 'sign_cloudinary' },
      async () => {
        globalThis.xyzEnv = {};

        const { default: cloudinary } = await import(
          '../../../mod/sign/cloudinary.js'
        );

        const cloudinaryError = await cloudinary();

        codi.assertTrue(cloudinaryError instanceof Error);
        codi.assertEqual(
          cloudinaryError.message,
          'CLOUDINARY_URL not provided in xyzEnv',
        );
      },
    );

    await codi.it(
      { name: 'no folder provided', parentId: 'sign_cloudinary' },
      async () => {
        globalThis.xyzEnv = {
          CLOUDINARY_URL: 'https://cloudinary.test.com',
        };

        const { default: cloudinary } = await import(
          '../../../mod/sign/cloudinary.js'
        );

        const { req, res } = codi.mockHttp.createMocks({
          params: {},
        });

        const cloudinaryError = await cloudinary(req, res);

        codi.assertTrue(cloudinaryError instanceof Error);

        codi.assertEqual(
          cloudinaryError.message,
          'A folder request param is required for the cloudinary signer.',
        );
      },
    );

    await codi.it(
      { name: 'no public_id provided', parentId: 'sign_cloudinary' },
      async () => {
        globalThis.xyzEnv = {
          CLOUDINARY_URL: 'https://cloudinary.test.com',
        };

        const { default: cloudinary } = await import(
          '../../../mod/sign/cloudinary.js'
        );

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            folder: './test',
          },
        });

        const cloudinaryError = await cloudinary(req, res);

        codi.assertTrue(cloudinaryError instanceof Error);

        codi.assertEqual(
          cloudinaryError.message,
          'A public_id request param is required for the cloudinary signer.',
        );
      },
    );
  },
);
