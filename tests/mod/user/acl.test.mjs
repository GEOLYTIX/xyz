globalThis.xyzEnv = {
  PRIVATE: '192.168.1.1:3000|user:password|acl.test',
};

const mockPgConnectFn = codi.mock.fn();
const mockPgQueryFn = codi.mock.fn();

const mockPg = codi.mock.module('pg', {
  defaultExport: {
    Pool: class Pool {
      constructor() {
        this.connect = mockPgConnectFn;
      }
    },
  },
});

await codi.describe(
  { name: 'acl: ', id: 'user_acl', parentId: 'user' },
  async () => {
    const { default: acl } = await import('../../../mod/user/acl.js');

    await codi.it(
      { name: 'Get users from acl', parentId: 'user_acl' },
      async () => {
        mockPgConnectFn.mock.mockImplementation(function connect() {
          return {
            query: mockPgQueryFn,
            release: () => {
              return 'Released the client';
            },
          };
        });

        mockPgQueryFn.mock.mockImplementation(function query() {
          return {
            rows: ['user1', 'user2', 'user3'],
          };
        });

        const q = 'select * from acl_schema.acl_table';
        const arr = [];

        const result = await acl(q, arr);

        codi.assertEqual(result, ['user1', 'user2', 'user3']);
      },
    );
  },
);

mockPg.restore();

globalThis.xyzEnx = {};
