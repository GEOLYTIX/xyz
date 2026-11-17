import { describe, expect, it, vi } from 'vitest';

globalThis.xyzEnv = {
  PRIVATE: '192.168.1.1:3000|user:password|acl.test',
};

const mockPgConnectFn = vi.fn();
const mockPgQueryFn = vi.fn();
const mockPgOnFn = vi.fn();

vi.mock('pg', () => ({
  default: {
    Pool: class Pool {
      constructor() {
        this.connect = mockPgConnectFn;
        this.on = mockPgOnFn;
      }
    },
  },
}));

const { default: acl } = await import('@geolytix/xyz-app/mod/user/acl.js');

describe('acl:', () => {
  it('Get users from acl', async () => {
    mockPgConnectFn.mockImplementation(() => {
      return {
        query: mockPgQueryFn,
        release: () => {
          return 'Released the client';
        },
      };
    });

    mockPgQueryFn.mockImplementation(() => {
      return {
        rows: ['user1', 'user2', 'user3'],
      };
    });

    const q = 'select * from acl_schema.acl_table';
    const arr = [];

    const result = await acl(q, arr);

    expect(result).toEqual(['user1', 'user2', 'user3']);
  });

  it('listens for errors of idle pool clients', () => {
    expect(mockPgOnFn).toHaveBeenCalledWith('error', expect.any(Function));
  });
});
