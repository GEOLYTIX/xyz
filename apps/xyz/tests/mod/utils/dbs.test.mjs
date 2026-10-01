import { afterEach, describe, expect, it, vi } from 'vitest';

const pools = [];

// Each fake client records the statements it is sent, so a test asserts the exact sequence.
vi.mock('pg', () => {
  class Pool {
    constructor(options) {
      this.options = options;
      this.clients = [];
      pools.push(this);
    }

    on() {}

    async connect() {
      const client = {
        queries: [],
        query: vi.fn(async (sql, values) => {
          client.queries.push(values ? [sql, values] : [sql]);
          if (sql === 'FAIL')
            throw Object.assign(new Error('boom'), { code: '42P01' });
          return { rows: sql.startsWith('SELECT 1') ? [{ ok: 1 }] : [] };
        }),
        release: vi.fn(),
      };
      this.clients.push(client);
      return client;
    }
  }

  return { default: { Pool } };
});

async function importDbs(env) {
  vi.resetModules();
  pools.length = 0;
  globalThis.xyzEnv = { RETRY_LIMIT: 3, ...env };

  return (await import('../../../mod/utils/dbs.js')).default;
}

describe('dbs Module', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis.xyzEnv = {};
  });

  it('queries a connection without the rls suffix outside a transaction', async () => {
    const dbs = await importDbs({ DBS_PLAIN: 'postgres://plain' });

    const rows = await dbs.PLAIN('SELECT 1', [], 1000);

    expect(rows).toEqual([{ ok: 1 }]);
    expect(dbs.PLAIN.rls).toBeUndefined();
    expect(pools[0].options.connectionString).toBe('postgres://plain');
    expect(pools[0].clients[0].queries).toEqual([
      ['SET statement_timeout = 1000'],
      ['SELECT 1', []],
    ]);
  });

  it('keeps a connection string with a pipe but no trailing rls suffix whole', async () => {
    const dbs = await importDbs({ DBS_PIPE: 'postgres://user:pa|ss@host/db' });

    expect(dbs.PIPE.rls).toBeUndefined();
    expect(pools[0].options.connectionString).toBe(
      'postgres://user:pa|ss@host/db',
    );
  });

  it('strips only the trailing rls suffix from a connection string with a pipe', async () => {
    const dbs = await importDbs({
      DBS_PIPE: 'postgres://user:pa|ss@host/db|rls=app_user',
    });

    expect(dbs.PIPE.rls).toBe('app_user');
    expect(pools[0].options.connectionString).toBe(
      'postgres://user:pa|ss@host/db',
    );
  });

  it('strips the rls suffix from the connection string', async () => {
    const dbs = await importDbs({
      DBS_FENCED: 'postgres://fenced|rls=app_user',
    });

    expect(dbs.FENCED.rls).toBe('app_user');
    expect(pools[0].options.connectionString).toBe('postgres://fenced');
  });

  it('runs an rls query in a transaction as the role with the tenant set', async () => {
    const dbs = await importDbs({
      DBS_FENCED: 'postgres://fenced|rls=app_user',
    });

    const rows = await dbs.FENCED('SELECT 1 WHERE $1', ['x'], 1000, 7);

    expect(rows).toEqual([{ ok: 1 }]);
    expect(pools[0].clients[0].queries).toEqual([
      ['BEGIN'],
      ['SET LOCAL ROLE "app_user"'],
      [`SELECT set_config('app.tenant_id', $1, true)`, ['7']],
      ['SET LOCAL statement_timeout = 1000'],
      ['SELECT 1 WHERE $1', ['x']],
      ['COMMIT'],
    ]);
  });

  it('destroys the client without committing when an rls query fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const dbs = await importDbs({
      DBS_FENCED: 'postgres://fenced|rls=app_user',
    });

    const result = await dbs.FENCED('FAIL', [], 1000, 7);

    expect(result).toBeInstanceOf(Error);
    expect(pools[0].clients[0].queries.at(-1)).toEqual(['FAIL', []]);
    expect(pools[0].clients[0].release).toHaveBeenCalledWith(true);
  });

  it('returns an error without connecting when an rls query has no tenant_id', async () => {
    const dbs = await importDbs({
      DBS_FENCED: 'postgres://fenced|rls=app_user',
    });

    const result = await dbs.FENCED('SELECT 1', [], 1000);

    expect(result).toBeInstanceOf(Error);
    expect(result.message).toBe(
      'DBS FENCED requires a tenant_id for row level security.',
    );
    expect(pools[0].clients).toHaveLength(0);
  });

  it('returns an error for a tenant_id which is not an integer', async () => {
    const dbs = await importDbs({
      DBS_FENCED: 'postgres://fenced|rls=app_user',
    });

    const result = await dbs.FENCED('SELECT 1', [], 1000, '7');

    expect(result).toBeInstanceOf(Error);
    expect(pools[0].clients).toHaveLength(0);
  });

  it('does not create a connection with an invalid rls role', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const dbs = await importDbs({
      DBS_BAD: 'postgres://bad|rls=app_user"; drop table x; --',
    });

    expect(Object.hasOwn(dbs, 'BAD')).toBe(false);
    expect(pools).toHaveLength(0);
    expect(warn).toHaveBeenCalledWith(
      'DBS_BAD: Invalid rls role: app_user"; drop table x; --',
    );
  });
});
