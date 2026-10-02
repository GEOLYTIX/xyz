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

      const rows = await dbs.TEST({ query: 'SELECT 1', variables: [1] });

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

      await dbs.TEST({ query: 'SELECT 1' });
      await dbs.TEST({ query: 'SELECT 1', timeout: 3000 });

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

      await dbs.TEST({ query: 'SELECT 1' });

      expect(client.query).toHaveBeenCalledTimes(1);
    });

    it('returns non retryable errors without retry', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const error = pgError('42P01', 'relation does not exist');
      const client = mockClient(error);
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST({ query: 'SELECT * FROM missing' });

      expect(result).toBe(error);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('returns connection errors without release', async () => {
      const dbs = await importDbs();
      const error = new Error('timeout exceeded when trying to connect');
      pools[0].connect.mockRejectedValueOnce(error);

      const result = await dbs.TEST({ query: 'SELECT 1' });

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

      const promise = dbs.TEST({ query: 'SELECT 1' });

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

      const promise = dbs.TEST({ query: 'SELECT 1' });
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

      const promise = dbs.TEST({ query: 'SELECT 1' });
      await vi.runAllTimersAsync();

      await expect(promise).resolves.toBe(connectError);
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('makes a single attempt if the RETRY_LIMIT is not a positive number', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '0' });
      const error = pgError('53300');
      pools[0].connect.mockResolvedValueOnce(mockClient(error));

      await expect(dbs.TEST({ query: 'SELECT 1' })).resolves.toBe(error);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry logging', () => {
    // The mocked logger keeps calls from previous tests and must be cleared.
    async function importLogger() {
      const logger = (await import('../../../mod/utils/logger.js')).default;
      logger.mockClear();
      return logger;
    }

    it('logs the reason and backoff delay for each retry', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const logger = await importLogger();
      pools[0].connect
        .mockResolvedValueOnce(
          mockClient(pgError('53300', 'too many connections')),
        )
        .mockResolvedValueOnce(
          mockClient(pgError('57P01', 'terminating connection')),
        )
        .mockResolvedValueOnce(mockClient([{ id: 1 }]));

      const promise = dbs.TEST({ query: 'SELECT 1' });
      await vi.runAllTimersAsync();
      await promise;

      expect(logger.mock.calls).toEqual([
        [
          {
            attempt: 1,
            code: '53300',
            dbs: 'TEST',
            delay: 1000,
            message: 'Retry 2 of 3 in 1000ms.',
            reason: 'too many connections',
          },
          'dbs_retry',
        ],
        [
          {
            attempt: 2,
            code: '57P01',
            dbs: 'TEST',
            delay: 2000,
            message: 'Retry 3 of 3 in 2000ms.',
            reason: 'terminating connection',
          },
          'dbs_retry',
        ],
      ]);
    });

    it('logs the backoff before waiting for the retry', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '2' });
      const logger = await importLogger();
      pools[0].connect
        .mockResolvedValueOnce(mockClient(pgError('53300')))
        .mockResolvedValueOnce(mockClient([{ id: 1 }]));

      const promise = dbs.TEST({ query: 'SELECT 1' });

      await vi.advanceTimersByTimeAsync(0);
      expect(logger).toHaveBeenCalledTimes(1);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);

      await vi.runAllTimersAsync();
      await promise;
      expect(pools[0].connect).toHaveBeenCalledTimes(2);
    });

    it('logs when the retries are exhausted', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '2' });
      const logger = await importLogger();
      pools[0].connect
        .mockResolvedValueOnce(mockClient(pgError('53300')))
        .mockResolvedValueOnce(
          mockClient(pgError('57P03', 'cannot connect now')),
        );

      const promise = dbs.TEST({ query: 'SELECT 1' });
      await vi.runAllTimersAsync();
      await promise;

      expect(logger).toHaveBeenCalledTimes(2);
      expect(logger).toHaveBeenLastCalledWith(
        {
          attempts: 2,
          code: '57P03',
          dbs: 'TEST',
          message: 'Retries exhausted.',
          reason: 'cannot connect now',
        },
        'dbs_retry',
      );
    });

    it('does not log a retry for non retryable errors', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const logger = await importLogger();
      pools[0].connect.mockResolvedValueOnce(mockClient(pgError('42P01')));

      await dbs.TEST({ query: 'SELECT 1' });

      expect(logger).not.toHaveBeenCalled();
    });

    it('does not log a retry for nonblocking queries', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const logger = await importLogger();
      const client = mockClient(pgError('53300'));
      pools[0].connect.mockResolvedValueOnce(client);

      await dbs.TEST({ nonblocking: true, query: 'SELECT 1' });
      await vi.waitFor(() => expect(client.release).toHaveBeenCalled());

      expect(logger).not.toHaveBeenCalled();
    });
  });

  describe('nonblocking queries', () => {
    it('resolves true once the query is sent without waiting for the result', async () => {
      const dbs = await importDbs();
      let resolveQuery;
      const client = {
        query: vi.fn((sql) => {
          if (sql.startsWith('SET statement_timeout')) return Promise.resolve();
          return new Promise((resolve) => {
            resolveQuery = resolve;
          });
        }),
        release: vi.fn(),
      };
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST({
        nonblocking: true,
        query: 'INSERT INTO log',
        timeout: 3000,
        variables: [],
      });

      expect(result).toBe(true);

      // The statement timeout is set and the query is sent before resolving.
      expect(client.query.mock.calls).toEqual([
        ['SET statement_timeout = 3000'],
        ['INSERT INTO log', []],
      ]);
      expect(client.release).not.toHaveBeenCalled();

      resolveQuery({ rows: [] });
      await vi.waitFor(() => expect(client.release).toHaveBeenCalledTimes(1));
    });

    it('does not resolve before the statement timeout is set', async () => {
      const dbs = await importDbs();
      let resolveTimeout;
      const client = {
        query: vi.fn((sql) => {
          if (sql.startsWith('SET statement_timeout')) {
            return new Promise((resolve) => {
              resolveTimeout = resolve;
            });
          }
          return Promise.resolve({ rows: [] });
        }),
        release: vi.fn(),
      };
      pools[0].connect.mockResolvedValueOnce(client);

      const onResolved = vi.fn();
      const promise = dbs
        .TEST({
          nonblocking: true,
          query: 'INSERT INTO log',
          timeout: 3000,
          variables: [],
        })
        .then(onResolved);

      await vi.waitFor(() => expect(client.query).toHaveBeenCalledTimes(1));
      expect(onResolved).not.toHaveBeenCalled();

      resolveTimeout();
      await promise;

      expect(onResolved).toHaveBeenCalledWith(true);
      expect(client.query).toHaveBeenCalledWith('INSERT INTO log', []);
    });

    it('resolves with the error if the statement timeout cannot be set', async () => {
      const dbs = await importDbs();
      const error = pgError('22023', 'invalid value for parameter');
      const client = {
        query: vi.fn(() => Promise.reject(error)),
        release: vi.fn(),
      };
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST({
        nonblocking: true,
        query: 'INSERT INTO log',
        timeout: 3000,
      });

      expect(result).toBe(error);
      expect(client.query).toHaveBeenCalledTimes(1);
      expect(client.release).toHaveBeenCalledTimes(1);
    });

    it('resolves with the error without retry if the connection fails', async () => {
      vi.useFakeTimers();
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const error = pgError('53300');
      pools[0].connect.mockRejectedValueOnce(error);

      const result = await dbs.TEST({ nonblocking: true, query: 'SELECT 1' });

      expect(result).toBe(error);
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
      expect(vi.getTimerCount()).toBe(0);
    });

    it('logs query errors after the query is sent', async () => {
      const dbs = await importDbs({ RETRY_LIMIT: '3' });
      const error = pgError('57P01');
      const client = mockClient(error);
      pools[0].connect.mockResolvedValueOnce(client);

      const result = await dbs.TEST({ nonblocking: true, query: 'SELECT 1' });

      expect(result).toBe(true);
      await vi.waitFor(() => expect(console.error).toHaveBeenCalledWith(error));
      expect(pools[0].connect).toHaveBeenCalledTimes(1);
      expect(client.release).toHaveBeenCalledTimes(1);
    });
  });
});
