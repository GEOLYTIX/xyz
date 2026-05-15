import { afterEach, describe, expect, it, vi } from 'vitest';

async function importLogger(env = {}) {
  vi.resetModules();
  globalThis.xyzEnv = env;

  return (await import('../../../mod/utils/logger.js')).default;
}

describe('logger Module', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete globalThis.fetch;
    globalThis.xyzEnv = {};
  });

  it('logs structured sanitized values to stdout', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const log = await importLogger({ LOGS: 'query' });

    log(
      {
        params: ['safe', 'line\nbreak'],
        sql: 'SELECT *\r\nFROM table',
      },
      'query',
    );

    expect(consoleLog).toHaveBeenCalledWith({
      message: {
        params: ['safe', 'line_break'],
        sql: 'SELECT *__FROM table',
      },
      time: expect.any(Date),
    });
  });

  it('logs structured sanitized values to configured loggers', async () => {
    globalThis.fetch = vi.fn(() => Promise.resolve());
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const log = await importLogger({
      LOGGER: 'logflare:apikey=test_key&source=test_source',
      LOGS: 'query',
    });

    log('Data: first line\r\nsecond line', 'query');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.logflare.app/logs/json?source=test_source',
      expect.objectContaining({
        method: 'post',
      }),
    );

    const body = JSON.parse(fetch.mock.calls[0][1].body);
    const processLog = Object.entries(body).find(([key]) => key !== 'key')[1];

    expect(body.key).toBe('query');
    expect(processLog).toEqual({
      message: 'Data: first line__second line',
      time: expect.any(String),
    });
  });
});
