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

  it('redacts objects before logging', async () => {
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

    expect(consoleLog).toHaveBeenCalledWith('[Object]');
  });

  it('redacts strings before logging', async () => {
    const logger = await importLogger();
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

    logger(
      '/view?workspace=demo&token=abc123&apikey=xyz Authorization: Bearer abc.def',
      'view-req-url',
    );

    expect(consoleLog).toHaveBeenCalledWith('[REDACTED]');
  });

  it('redacts errors before writing to stderr', async () => {
    const logger = await importLogger();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    logger(new Error('Failed with token=abc123'));

    expect(consoleError).toHaveBeenCalledWith('[Error]');
  });

  it('sends redacted values to configured remote loggers', async () => {
    const fetchMock = vi.fn().mockResolvedValue({});
    vi.stubGlobal('fetch', fetchMock);

    const logger = await importLogger({
      LOGGER: 'logflare:apikey=test-api-key&source=test-source',
    });

    logger({ api_key: 'secret', value: 'safe' }, 'query_params');

    expect(fetchMock).toHaveBeenCalledTimes(1);

    const request = fetchMock.mock.calls[0][1];
    const body = JSON.parse(request.body);
    const processId = Object.keys(body).find((key) => key !== 'key');

    expect(body.key).toBe('query_params');
    expect(body[processId]).toBe('[Object]');
  });
});
