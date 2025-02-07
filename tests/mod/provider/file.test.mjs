const fsMockFn = codi.mock.fn();
const fsMock = codi.mock.module('fs', {
  namedExports: {
    readFileSync: fsMockFn,
  },
});

const mockPathdirnameFn = codi.mock.fn();
const mockPathJoinFn = codi.mock.fn();
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

await codi.describe({ name: 'file:', id: 'provider_file' }, async () => {
  await codi.it(
    { name: 'Get File test', parentId: 'provider_file' },
    async () => {
      fsMockFn.mock.mockImplementation(function readFileSync() {
        return JSON.stringify({ text: 'I am a file' });
      });

      mockPathdirnameFn.mock.mockImplementation(function dirname() {
        return 'test.json';
      });

      mockPathJoinFn.mock.mockImplementation(function dirname() {
        '../../test.json';
      });

      const { default: file } = await import('../../../mod/provider/file.js');

      const results = await file('../../dir/tests/thing.json');
    },
  );
});

fsMock.restore();
mockPath.restore();
mockedUrl.restore();
