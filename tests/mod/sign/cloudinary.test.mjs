await codi.describe(
  { name: 'cloudinary:', id: 'sign_cloudinary', parentId: 'sign' },
  async () => {
    const { default: cloudinary } = await import(
      '../../../mod/sign/cloudinary.js'
    );

    await codi.it(
      { name: 'no cloudinary url configured', parentId: 'sign_cloudinary' },
      async () => {
        globalThis.xyzEnv = {};

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

    await codi.it(
      { name: 'get url', parentId: 'sign_cloudinary' },
      async () => {
        const id1 = crypto.randomUUID();
        const id2 = crypto.randomUUID();

        globalThis.xyzEnv = {
          CLOUDINARY_URL: `cloudinary://${id1}:${id2}@test`,
        };

        const { req, res } = codi.mockHttp.createMocks({
          params: {
            folder: './test',
            public_id: 'public_id',
          },
        });

        const cloudinaryURL = await cloudinary(req, res);

        codi.assertTrue(cloudinaryURL.includes(id1));
        codi.assertTrue(cloudinaryURL.includes(id2));
        codi.assertTrue(
          cloudinaryURL.includes('https://api.cloudinary.com/v1_1/'),
        );
        codi.assertTrue(cloudinaryURL.includes('upload'));
      },
    );
  },
);
