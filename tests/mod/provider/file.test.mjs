await codi.describe(
  { name: 'file:', id: 'provider_file', parentId: 'provider' },
  async () => {
    const { default: file } = await import('../../../mod/provider/file.js');
    await codi.it(
      { name: 'Get File test', parentId: 'provider_file' },
      async () => {
        const fileContent = { text: 'I am a file' };

        readFileSyncFn.mock.mockImplementationOnce(() => {
          return JSON.stringify(fileContent);
        });

        const results = file('../../dir/tests/thing.json');

        codi.assertEqual(results, fileContent);
      },
    );
  },
);
