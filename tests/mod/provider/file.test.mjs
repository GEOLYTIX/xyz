const { readFileSync } = await import('fs');
const fsMockFn = codi.mock.fn(readFileSync);
const fsMock = codi.mock.module('fs', {
  namedExports: {
    readFileSync: fsMockFn,
  },
});

globalThis.fsMockFn = fsMockFn;

const { dirname, join } = await import('path');

const mockPathdirnameFn = codi.mock.fn(dirname);
const mockPathJoinFn = codi.mock.fn(join);
const mockPath = codi.mock.module('path', {
  namedExports: {
    dirname: mockPathdirnameFn,
    join: mockPathJoinFn,
  },
});

const mockedUrlFn = codi.mock.fn();
const mockedUrl = codi.mock.module('url', {
  namedExports: {
    fileURLToPath: mockedUrlFn,
  },
});

await codi.describe(
  { name: 'file:', id: 'provider_file', parentId: 'provider' },
  async () => {
    const { default: file } = await import('../../../mod/provider/file.js');
    await codi.it(
      { name: 'Get File test', parentId: 'provider_file' },
      async () => {
        const fileContent = { text: 'I am a file' };
        fsMockFn.mock.mockImplementationOnce(function readFileSync() {
          return JSON.stringify(fileContent);
        });

        mockPathdirnameFn.mock.mockImplementationOnce(function dirname() {
          return 'test.json';
        });

        mockPathJoinFn.mock.mockImplementationOnce(function dirname() {
          '../../test.json';
        });

        const results = await file('../../dir/tests/thing.json');

        codi.assertEqual(results, fileContent);
      },
    );
  },
);

fsMock.restore();
mockPath.restore();
mockedUrl.restore();
