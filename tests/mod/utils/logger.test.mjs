import { afterEach, describe, expect, it, vi } from 'vitest';

async function importLogger(env = {}) {
  vi.resetModules();

  globalThis.xyzEnv = {
    LOGS: 'query_params,view-req-url',
    ...env,
  };

  return (await import('../../../mod/utils/logger.js')).default;
}

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.resetModules();
    globalThis.xyzEnv = {};
  });

  it('logs objects unchanged', async () => {
    const logger = await importLogger();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger(
      {
        nested: {
          authorization: 'Bearer secret-token',
          ok: true,
        },
        password: 'super-secret',
        q: 'stores',
      },
      'query_params',
    );

    expect(consoleLog).toHaveBeenCalledWith({
      nested: {
        authorization: 'Bearer secret-token',
        ok: true,
      },
      password: 'super-secret',
      q: 'stores',
    });
  });

  it('does not log disabled keys', async () => {
    const logger = await importLogger();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger('secret-token', 'disabled');

    expect(consoleLog).not.toHaveBeenCalled();
  });

  it('logs errors when LOGS is not configured', async () => {
    const logger = await importLogger({ LOGS: undefined });
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    logger('secret-token');

    expect(consoleError).toHaveBeenCalledWith('secret-token');
  });

  it('normalizes newlines in string logs', async () => {
    const logger = await importLogger();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger(
      '/view?workspace=demo&token=abc123\napikey=xyz\rAuthorization: Bearer abc.def',
      'view-req-url',
    );

    expect(consoleLog).toHaveBeenCalledWith(
      '/view?workspace=demo&token=abc123_apikey=xyz_Authorization: Bearer abc.def',
    );
  });

  it('logs arrays unchanged', async () => {
    const logger = await importLogger();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger(['token=abc123'], 'query_params');

    expect(consoleLog).toHaveBeenCalledWith(['token=abc123']);
  });

  it('logs errors unchanged to stderr', async () => {
    const logger = await importLogger();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const expected = new Error('Failed with token=abc123');

    logger(expected);

    expect(consoleError).toHaveBeenCalledWith(expected);
  });

  it('sends log values to configured remote loggers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', fetchMock);

    const logger = await importLogger({
      LOGGER: 'logflare:apikey=test-api-key&source=test-source',
    });

    logger({ api_key: 'secret', value: 'safe' }, 'query_params');

    expect(fetchMock).toHaveBeenCalledTimes(2);

    const request = fetchMock.mock.calls[0][1];
    const body = JSON.parse(request.body);
    const processId = Object.keys(body).find((key) => key !== 'key');

    expect(body.key).toBe('query_params');
    expect(body[processId]).toEqual({ api_key: 'secret', value: 'safe' });
  });

  it('logs Logflare request failures to stderr', async () => {
    const expected = new Error('fetch failed');
    const fetchMock = vi.fn().mockRejectedValue(expected);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.stubGlobal('fetch', fetchMock);

    const logger = await importLogger({
      LOGGER: 'logflare:apikey=test-api-key&source=test-source',
    });

    logger('secret-token', 'query_params');

    await Promise.resolve();

    expect(consoleError).toHaveBeenCalledWith(expected);
  });

  it('warns when the PostgreSQL logger connection is not configured', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await importLogger({
      LOGGER: 'postgresql:dbs=TEST&table=public.logs',
    });

    expect(consoleWarn).toHaveBeenCalledWith(
      'Logger module unable to find dbs=TEST',
    );
  });

  it('writes log values to the configured PostgreSQL logger', async () => {
    const dbMock = vi.fn();

    vi.doMock('../../../mod/utils/dbs.js', () => ({
      default: {
        TEST: dbMock,
      },
    }));

    const logger = await importLogger({
      DBS_TEST: 'postgresql://example',
      LOGGER: 'postgresql:dbs=TEST&table=public.logs;drop',
    });

    logger({ token: 'secret' }, 'query_params');

    await vi.waitFor(() => {
      expect(dbMock).toHaveBeenCalled();
    });

    expect(dbMock).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.logsdrop'),
      expect.arrayContaining([{ token: 'secret' }]),
      3000,
    );
  });
});
