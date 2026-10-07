import { EventEmitter } from 'node:events';
import { createRequest, createResponse } from 'node-mocks-http';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

const REQUEST_CONTEXT = Symbol.for('@vercel/request-context');

// The Vercel runtime exposes the request context with the waitUntil method on a global symbol.
const waitUntil = vi.fn();

let telemetry;

beforeAll(async () => {
  vi.stubEnv('VERCEL', '1');
  vi.stubEnv('OTEL_TRACES_EXPORTER', 'console');

  globalThis[REQUEST_CONTEXT] = { get: () => ({ waitUntil }) };

  vi.spyOn(console, 'log').mockImplementation(() => {});

  vi.resetModules();

  telemetry = await import('../../../mod/utils/telemetry.js');
});

afterAll(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  delete globalThis[REQUEST_CONTEXT];
});

describe('telemetry in a Vercel deployment', () => {
  it('flushes the spans when the response is closed', async () => {
    waitUntil.mockClear();

    const req = createRequest({ method: 'GET', url: '/api/workspace/locale' });
    const res = createResponse({ eventEmitter: EventEmitter });

    telemetry.requestSpan(req, res, () => {});
    res.emit('close');

    expect(waitUntil).toHaveBeenCalledTimes(1);
    await expect(waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
  });

  it('flushes the spans after a promise which settles after the response', async () => {
    waitUntil.mockClear();

    let settle;
    const pending = new Promise((resolve) => {
      settle = resolve;
    });

    telemetry.flushAfter(pending);

    expect(waitUntil).toHaveBeenCalledTimes(1);

    const flushed = vi.fn();
    waitUntil.mock.calls[0][0].then(flushed);

    // The flush waits for the pending promise.
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(flushed).not.toHaveBeenCalled();

    settle();
    await waitUntil.mock.calls[0][0];
    expect(flushed).toHaveBeenCalled();
  });

  it('flushes the spans after a rejected promise', async () => {
    waitUntil.mockClear();

    telemetry.flushAfter(Promise.reject(new Error('query failed')));

    await expect(waitUntil.mock.calls[0][0]).resolves.toBeUndefined();
  });
});
