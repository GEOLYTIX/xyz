const mocks3SignerFn = codi.mock.fn();
const mocks3 = codi.mock.module('../../../mod/sign/s3.js', {
  defaultExport: mocks3SignerFn,
});

await codi.describe(
  { name: 's3:', id: 's3_provider', parentId: 'provider' },
  async () => {
    const { default: s3_provider } = await import(
      '../../../mod/provider/s3.js'
    );
    await codi.it(
      { name: 'get from signer', parentId: 's3_provider' },
      async () => {
        const fileBody = JSON.stringify(
          '{ "templates": {}, "locale": { "layers": {}, }, }',
        );

        mocks3SignerFn.mock.mockImplementation(async function s3_signer() {
          return fileBody;
        });

        const result = await s3_provider();

        codi.assertEqual(result, fileBody);
      },
    );
  },
);

mocks3.restore();
