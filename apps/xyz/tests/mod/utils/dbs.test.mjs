import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Pools created by the dbs module on import.
const { pools } = vi.hoisted(() => ({ pools: [] }));

vi.mock('pg', () => {
  class Pool {
    constructor(options) {
      this.options = options;
      this.connect = vi.fn();
      this.on = vi.fn();
      pools.push(this);
    }
  }

  return { default: { Pool } };
});

vi.mock('../../../mod/utils/logger.js', () => ({ default: vi.fn() }));

async function importDbs(env = {}) {
  vi.resetModules();
  pools.length = 0;
  globalThis.xyzEnv = { DBS_TEST: 'postgres://test', ...env };

  return (await import('../../../mod/utils/dbs.js')).default;
}

// Returns a mock client which resolves the query with the provided rows or rejects with the provided error.
function mockClient(result) {
  return {
    query: vi.fn((sql) => {
      if (sql.startsWith('SET statement_timeout')) return Promise.resolve();
      if (result instanceof Error) return Promise.reject(result);
      return Promise.resolve({ rows: result });
    }),
    release: vi.fn(),
  };
}

function pgError(code, message = code) {
  return Object.assign(new Error(message), { code });
}

describe('dbs Module', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    globalThis.xyzEnv = {};
  });

  describe('connection pools', () => {
    it('creates a pool for each DBS_ key in the xyzEnv', async () => {
      const dbs = await importDbs({
        DBS_MY_DB: 'postgres://my_db',
        NOT_DBS: 'postgres://ignored',
      });

      expect(Object.keys(dbs)).toEqual(['TEST', 'MY_DB']);
      expect(pools.map((pool) => pool.options.connectionString)).toEqual([
        'postgres://test',
        'postgres://my_db',
      ]);
    });

    it('registers an error handler on each pool', async () => {
      await importDbs();

      expect(pools[0].on).toHaveBeenCalledWith('error', expect.any(Function));
    });
  });

  describe('blocking queries', () => {
    it('returns rows and releases the client once', async () => {
      const dbs = await importDbs();
      const client = mockClient([{ id: 1 }]);
      pools[0].connect.mockResolvedValueOnce(client);

      const rows = await dbs.TEST('SELECT 1', [1]);

      expect(rows).toEqual([{ id: 1 }]);
      expect(client.query).toHaveBeenCalledWith('SELECT 1', [1]);
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('sets the statement timeout from the argument or xyzEnv', async () => {
      const dbs = await importDbs({ STATEMENT_TIMEOUT: '1000' });
      const defaultClient = mockClient([]);
      const argClient = mockClient([]);
      pools[0].connect
        .mockResolvedValueOnce(defaultClient)
        .mockResolvedValueOnce(argClient);

      await dbs.TEST('SELECT 1');
      await dbs.TEST('SELECT 1', [], 3000);

      expect(defaultClient.query).toHaveBeenCalledWith(
        'SET statement_timeout = 1000',
      );
      expect(argClient.query).toHaveBeenCalledWith(
        'SET statement_timeout = 3000',
      );
    });

    it('does not set a statement timeout if none is provided', async () => {
      const dbs = await importDbs();
      const client = mockClient([]);
      pools[0].connect.mockResolvedValueOnce(client);

      await dbs.TEST('SELECT 1');

      expect(client.query).toHaveBeenCalledTimes(1);
    });

    it('returns non retryable errors without retry', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const error = pgError('42P01', 'relation does not exist');
      const client = mockClient(error);
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST('SELECT * FROM missing');

      expect(result).toBe(error);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('returns connection errors without release', async () => {
      const dbs = await importDbs();
      const error = new Error('timeout exceeded when trying to connect');
      pools[0].connect.mockRejectedValueOnce(error);

      const result = await dbs.TEST('SELECT 1');

      expect(result).toBe(error);
    });

    it('retries retryable errors with exponential backoff', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const clients = [
        mockClient(pgError('53300')),
        mockClient(pgError('57P01')),
        mockClient([{ id: 1 }]),
      ];
      clients.forEach((client) =>
        pools[0].connect.mockResolvedValueOnce(client),
      );

      const promise = dbs.TEST('SELECT 1');

      await vi.advanceTimersByTimeAsync(0);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);

      // The client of the failed attempt is released before the backoff.
      expect(clients[0].release).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(999);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1);
      expect(pools[0].connect).toHaveBeenCalledTimes(2);

      await vi.advanceTimersByTimeAsync(2000);
      expect(pools[0].connect).toHaveBeenCalledTimes(3);

      await expect(promise).resolves.toEqual([{ id: 1 }]);
      clients.forEach((client) =>
        expect(client.release).toHaveBeenCalledTimes(1),
      );
    });

    it('returns the last error once the retry limit is exhausted', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '2' });
      const lastError = pgError('57P03');
      pools[0].connect
        .mockResolvedValueOnce(mockClient(pgError('53300')))
        .mockResolvedValueOnce(mockClient(lastError));

      const promise = dbs.TEST('SELECT 1');
      await vi.runAllTimersAsync();

      await expect(promise).resolves.toBe(lastError);
      expect(pools[0].connect).toHaveBeenCalledTimes(2);
    });

    it('does not release a client twice if a retry fails to connect', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '2' });
      const client = mockClient(pgError('57P01'));
      const connectError = pgError('08006');
      pools[0].connect
        .mockResolvedValueOnce(client)
        .mockRejectedValueOnce(connectError);

      const promise = dbs.TEST('SELECT 1');
      await vi.runAllTimersAsync();

      await expect(promise).resolves.toBe(connectError);
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('makes a single attempt if the RETRY_LIMIT is not a positive number', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '0' });
      const error = pgError('53300');
      pools[0].connect.mockResolvedValueOnce(mockClient(error));

      await expect(dbs.TEST('SELECT 1')).resolves.toBe(error);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('nonblocking queries', () => {
    it('resolves true once connected without waiting for the query', async () => {
      const dbs = await importDbs();
      let resolveQuery;
      const client = {
        query: vi.fn(
          () =>
            new Promise((resolve) => {
              resolveQuery = resolve;
            }),
        ),
        release: vi.fn(),
      };
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST('SELECT 1', [], undefined, {
        nonblocking: true,
      });

      expect(result).toBe(true);
      expect(client.release).not.toHaveBeenCalled();

      resolveQuery({ rows: [] });
      await vi.waitFor(() => expect(client.release).toHaveBeenCalledTimes(1));
    });

    it('resolves with the error without retry if the connection fails', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const error = pgError('53300');
      pools[0].connect.mockRejectedValueOnce(error);

      const result = await dbs.TEST('SELECT 1', [], undefined, {
        nonblocking: true,
      });

      expect(result).toBe(error);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('logs query errors after the client is connected', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const error = pgError('57P01');
      const client = mockClient(error);
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST('SELECT 1', [], undefined, {
        nonblocking: true,
      });

      expect(result).toBe(true);
      await vi.waitFor(() => expect(console.error).toHaveBeenCalledWith(error));
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
      expect(client.release).toHaveBeenCalledTimes(1);
    });
  });
});
