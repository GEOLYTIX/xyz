/**
 * @module tests/mod/provider/file
 */

/**
 * Test suite for the file provider
 * Tests the ability to read and parse different types of files
 */
await codi.describe(
  { name: 'file:', id: 'provider_file', parentId: 'provider' },
  async () => {
    const { default: file } = await import('../../../mod/provider/file.js');

    /**
     * Test case: Verify JSON file reading and parsing
     * Mocks the readFileSync function to return a JSON string
     * Expects the file provider to return the parsed JSON object
     */
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

    /**
     * Test case: Verify reading files without extensions
     * Tests the file provider's ability to read and return content from files without extensions
     * Expects the file provider to return the file content as a string
     */
    await codi.it(
      { name: 'Get file with no extension', parentId: 'provider_file' },
      async () => {
        const fileContent = 'I am a file with no extension\n';

        const results = file('./tests/assets/file');

        codi.assertEqual(results, fileContent);
      },
    );
  },
);
