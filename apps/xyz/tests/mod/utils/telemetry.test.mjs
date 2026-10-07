import { EventEmitter } from 'node:events';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  NodeTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-node';
import { createRequest, createResponse } from 'node-mocks-http';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

// Pools created by the dbs module on import.
const { pools } = vi.hoisted(() => ({ pools: [] }));

vi.mock('pg', () => {
  class Pool {
    constructor(options) {
      this.options = options;
      this.connect = vi.fn();
      this.on = vi.fn();
      this.totalCount = 1;
      this.idleCount = 0;
      this.waitingCount = 0;
      pools.push(this);
    }
  }

  return { default: { Pool } };
});

const exporter = new InMemorySpanExporter();

const telemetry = await import('../../../mod/utils/telemetry.js');

beforeAll(() => {
  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });

  provider.register();

  telemetry.registerTracerProvider(provider);
});

afterEach(() => {
  exporter.reset();
  vi.restoreAllMocks();
});

function spans(name) {
  return exporter.getFinishedSpans().filter((span) => span.name === name);
}

function isChild(child, parent) {
  return child.parentSpanContext?.spanId === parent.spanContext().spanId;
}

describe('withSpan', () => {
  it('nests spans created within the wrapped method', async () => {
    await telemetry.withSpan('parent', { attr: 'a' }, () =>
      telemetry.withSpan('child', {}, () => true),
    );

    const [parent] = spans('parent');
    const [child] = spans('child');

    expect(parent.attributes.attr).toBe('a');
    expect(isChild(child, parent)).toBe(true);
  });

  it('sets an error status for a returned Error', async () => {
    const result = await telemetry.withSpan(
      'returned',
      {},
      () => new Error('returned error'),
    );

    expect(result).toBeInstanceOf(Error);

    const [span] = spans('returned');
    expect(span.status.code).toBe(SpanStatusCode.ERROR);
    expect(span.status.message).toBe('returned error');
  });

  it('records a thrown exception and rethrows', async () => {
    await expect(
      telemetry.withSpan('thrown', {}, () => {
        throw new Error('thrown error');
      }),
    ).rejects.toThrow('thrown error');

    const [span] = spans('thrown');
    expect(span.status.code).toBe(SpanStatusCode.ERROR);
    expect(span.events[0].name).toBe('exception');
  });

  it('omits non primitive attribute values', async () => {
    await telemetry.withSpan(
      'attributes',
      { a: undefined, b: null, c: { d: 1 }, e: 'e', f: 0, g: false },
      () => true,
    );

    const [span] = spans('attributes');
    expect(span.attributes).toEqual({ e: 'e', f: 0, g: false });
  });
});

describe('requestSpan', () => {
  function mockRequest(url) {
    const req = createRequest({ method: 'GET', url });
    const res = createResponse({ eventEmitter: EventEmitter });
    return { req, res };
  }

  it('creates a root span with request and process attributes', async () => {
    const first = mockRequest('/api/query/test');
    const second = mockRequest('/api/workspace/locale');

    await new Promise((resolve) => {
      telemetry.requestSpan(first.req, first.res, async () => {
        telemetry.setRequestAttributes({ 'xyz.query.template': 'test' });
        await telemetry.withSpan('handler', {}, () => true);
        resolve();
      });
    });

    first.req.route = { path: '/api/query{/:template}' };
    first.res.statusCode = 200;
    first.res.emit('close');

    telemetry.requestSpan(second.req, second.res, () => {});
    second.res.statusCode = 500;
    second.res.emit('close');

    const [firstSpan, secondSpan] = exporter
      .getFinishedSpans()
      .filter((span) => span.kind === SpanKind.SERVER);

    const [handler] = spans('handler');

    expect(firstSpan.name).toBe('GET /api/query{/:template}');
    expect(isChild(handler, firstSpan)).toBe(true);
    expect(firstSpan.attributes).toMatchObject({
      'faas.coldstart': true,
      'http.route': '/api/query{/:template}',
      'http.response.status_code': 200,
      'url.path': '/api/query/test',
      'xyz.query.template': 'test',
    });
    expect(firstSpan.attributes['process.memory.rss']).toBeGreaterThan(0);

    expect(secondSpan.name).toBe('GET');
    expect(secondSpan.attributes['faas.coldstart']).toBe(false);
    expect(secondSpan.status.code).toBe(SpanStatusCode.ERROR);
  });
});

describe('workspace cache', () => {
  it('traces the workspace cache and source requests', async () => {
    globalThis.xyzEnv = {
      WORKSPACE: 'file:./tests/assets/_workspace.json',
      WORKSPACE_AGE: 3600000,
    };

    const { default: checkWorkspaceCache } = await import(
      '../../../mod/workspace/cache.js'
    );

    await telemetry.withSpan('request', {}, async () => {
      await checkWorkspaceCache();
      await checkWorkspaceCache();
    });

    const [cacheSpan] = spans('workspace.cache');

    // The second check is resolved from the cache without a span.
    expect(spans('workspace.cache').length).toBe(1);

    expect(cacheSpan.attributes).toMatchObject({
      'xyz.workspace.cache': 'initial',
      'xyz.workspace.src': 'file:./tests/assets/_workspace.json',
      'xyz.workspace.errors': 0,
    });
    expect(cacheSpan.attributes['xyz.workspace.templates']).toBeGreaterThan(0);

    const [getSrcSpan] = spans('getSrc');
    const [providerSpan] = spans('src.provider');

    expect(isChild(getSrcSpan, cacheSpan)).toBe(true);
    expect(getSrcSpan.attributes['xyz.src.cache_hit']).toBe(false);
    expect(isChild(providerSpan, getSrcSpan)).toBe(true);
    expect(providerSpan.attributes).toMatchObject({
      'xyz.src.provider': 'file',
      'xyz.src.type': 'object',
    });

    await checkWorkspaceCache(true);

    expect(spans('workspace.cache')[1].attributes['xyz.workspace.cache']).toBe(
      'force',
    );
  });

  it('traces cached sources', async () => {
    // The file provider logs the error for the missing source.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { cacheSources } = await import('../../../mod/provider/getSrc.js');

    await cacheSources({
      templates: {
        a: { src: 'file:./tests/assets/empty.json' },
        b: { src: 'file:./tests/assets/missing.json' },
      },
    });

    const [span] = spans('cacheSources');

    expect(span.attributes).toMatchObject({
      'xyz.src.count': 2,
      'xyz.src.errors': 1,
    });
  });
});

describe('dbs', () => {
  it('traces the query attempts and pool connect', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    globalThis.xyzEnv = { DBS_TEST: 'postgres://test', RETRY_LIMIT: '2' };

    const { default: dbs } = await import('../../../mod/utils/dbs.js');

    const client = {
      query: vi.fn((sql) => {
        if (sql.startsWith('SET statement_timeout')) return Promise.resolve();
        return Promise.resolve({ rows: [{ a: 1 }, { a: 2 }] });
      }),
      release: vi.fn(),
    };

    const busy = Object.assign(new Error('too many connections'), {
      code: '53300',
    });

    vi.useFakeTimers();

    pools[0].connect.mockRejectedValueOnce(busy).mockResolvedValueOnce(client);

    const result = dbs.TEST('SELECT 1', [], 1000);

    await vi.runAllTimersAsync();

    expect(await result).toHaveLength(2);

    vi.useRealTimers();

    const [querySpan] = spans('dbs.query');
    const connectSpans = spans('dbs.connect');

    expect(querySpan.attributes).toMatchObject({
      'db.system.name': 'postgresql',
      'xyz.dbs': 'TEST',
      'xyz.dbs.attempts': 2,
      'xyz.dbs.rows': 2,
      'xyz.dbs.statement_timeout': '1000',
      'xyz.dbs.nonblocking': false,
    });
    expect(querySpan.events[0].attributes['error.type']).toBe('53300');

    expect(connectSpans).toHaveLength(2);
    expect(connectSpans[0].status.code).toBe(SpanStatusCode.ERROR);
    expect(connectSpans[1].attributes['xyz.dbs.pool.total']).toBe(1);
    expect(isChild(connectSpans[1], querySpan)).toBe(true);
  });
});
