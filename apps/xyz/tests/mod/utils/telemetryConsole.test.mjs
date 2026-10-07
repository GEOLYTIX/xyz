import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { ConsoleTraceProcessor } from '../../../mod/utils/telemetryConsole.js';

// The span tree is logged as an object while a debugger is attached.
vi.mock('node:inspector', () => ({ default: { url: () => 'ws://debugger' } }));

let tracer;

beforeAll(() => {
  const provider = new NodeTracerProvider({
    spanProcessors: [new ConsoleTraceProcessor()],
  });

  provider.register();

  tracer = provider.getTracer('test');
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Starts an active span, awaits the fn, and ends the span.
function span(name, fn = () => {}, attributes) {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    await fn();
    span.end();
  });
}

describe('ConsoleTraceProcessor', () => {
  it('logs one span tree with summary per trace', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await span(
      'request',
      async () => {
        await span('getLocale', async () => {
          await span('composeObj');
          await span('getLayer', () => span('composeObj'));
        });
      },
      { route: '/api/workspace' },
    );

    expect(log).toHaveBeenCalledTimes(1);

    const [tree] = log.mock.calls[0];

    expect(tree.name).toBe('request');

    // The logged objects are created without prototype.
    expect(Object.getPrototypeOf(tree)).toBeNull();
    expect(Object.getPrototypeOf(tree.attributes)).toBeNull();
    expect(Object.getPrototypeOf(tree.summary.composeObj)).toBeNull();
    expect(tree.attributes).toEqual({ route: '/api/workspace' });
    expect(tree.traceId).toBeTypeOf('string');
    expect(tree.duration).toBeTypeOf('number');
    expect(tree.start).toBe(0);

    // The resource is logged with the first trace only.
    expect(tree.resource['service.name']).toBeDefined();

    expect(tree.summary.composeObj.count).toBe(2);
    expect(tree.summary.getLocale.count).toBe(1);
    expect(tree.summary.request).toBeUndefined();

    const [getLocale] = tree.children;

    expect(getLocale.name).toBe('getLocale');

    // Child spans start relative to the root span and after their parent.
    expect(getLocale.start).toBeGreaterThanOrEqual(0);
    expect(getLocale.children[1].start).toBeGreaterThanOrEqual(
      getLocale.children[0].start,
    );
    expect(getLocale.children.map((child) => child.name)).toEqual([
      'composeObj',
      'getLayer',
    ]);

    // Empty children arrays are removed.
    expect(getLocale.children[0].children).toBeUndefined();
    expect(getLocale.children[1].children[0].name).toBe('composeObj');
  });

  it('logs the resource with the first trace only', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    await span('second');

    expect(log.mock.calls[0][0].resource).toBeUndefined();
  });

  it('logs the span tree as a JSON string without debugger', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    const inspector = await import('node:inspector');
    vi.spyOn(inspector.default, 'url').mockReturnValue(undefined);

    await span('a', () => span('b', () => span('c', () => span('d'))));

    const [logged] = log.mock.calls[0];

    expect(logged).toBeTypeOf('string');

    // Nested children are not truncated as [Object].
    expect(JSON.parse(logged).children[0].children[0].children[0].name).toBe(
      'd',
    );
    expect(logged).not.toContain('[Object');
  });

  it('logs one line of JSON if the output is not a terminal', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    const inspector = await import('node:inspector');
    vi.spyOn(inspector.default, 'url').mockReturnValue(undefined);

    const isTTY = process.stdout.isTTY;

    try {
      process.stdout.isTTY = false;
      await span('line', () => span('child'));

      process.stdout.isTTY = true;
      await span('indented', () => span('child'));
    } finally {
      process.stdout.isTTY = isTTY;
    }

    const [[line], [indented]] = log.mock.calls;

    expect(line).not.toContain('\n');
    expect(JSON.parse(line).name).toBe('line');
    expect(indented).toContain('\n  "name": "indented"');
  });

  it('logs spans ending after the root span on their own', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    let late;

    await span('root', () => {
      late = tracer.startSpan('nonblocking');
    });

    late.end();

    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[0][0].name).toBe('root');
    expect(log.mock.calls[1][0].name).toBe('nonblocking');
  });
});

describe('ConsoleTraceProcessor minDuration', () => {
  const processor = new ConsoleTraceProcessor({ minDuration: '50' });

  // The tracer of an unregistered provider shares the global context manager.
  const slowTracer = new NodeTracerProvider({
    spanProcessors: [processor],
  }).getTracer('test');

  // Ends a root span with the duration in milliseconds.
  function rootSpan(name, duration, fn = () => {}) {
    const start = Date.now();
    return slowTracer.startActiveSpan(name, { startTime: start }, (span) => {
      fn();
      span.end(start + duration);
    });
  }

  it('does not log traces shorter than the minDuration', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    rootSpan('fast', 10);
    rootSpan('slow', 60);

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0].name).toBe('slow');
    expect(log.mock.calls[0][0].duration).toBe(60);
  });

  it('does not log or keep spans ending after a trace which was not logged', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});

    let late;

    rootSpan('fast', 10, () => {
      late = slowTracer.startSpan('nonblocking');
    });

    late.end();

    expect(log).not.toHaveBeenCalled();
    expect(processor.traces.size).toBe(0);
  });
});

describe('ConsoleTraceProcessor html', () => {
  it('writes the most recent traces to the HTML report, newest first', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});

    const dir = mkdtempSync(join(tmpdir(), 'xyz-traces-'));
    const file = join(dir, 'nested', 'local.html');

    const reportTracer = new NodeTracerProvider({
      spanProcessors: [new ConsoleTraceProcessor({ html: file })],
    }).getTracer('test');

    for (const name of ['first', 'second']) {
      await reportTracer.startActiveSpan(name, async (span) => {
        reportTracer.startSpan('child').end();
        span.end();
      });
    }

    const html = readFileSync(file, 'utf8');
    const items = JSON.parse(
      html.match(
        /<script type="application\/json" id="traces">(.*?)<\/script>/s,
      )[1],
    );

    expect(items.map((item) => item.trace.name)).toEqual(['second', 'first']);
    expect(items[0].meta.source).toBe('Local');
    expect(items[0].trace.children[0].name).toBe('child');

    rmSync(dir, { recursive: true, force: true });
  });
});

describe('ConsoleTraceProcessor html write errors', () => {
  it('retries the report with the next trace after a failed write', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const dir = mkdtempSync(join(tmpdir(), 'xyz-traces-'));
    const file = join(dir, 'local.html');

    // A directory at the report path fails the write.
    mkdirSync(file);

    const reportTracer = new NodeTracerProvider({
      spanProcessors: [new ConsoleTraceProcessor({ html: file })],
    }).getTracer('test');

    const trace = (name) =>
      reportTracer.startActiveSpan(name, (span) => span.end());

    trace('failed');
    trace('failed again');

    // The same error is only warned about once.
    expect(warn).toHaveBeenCalledTimes(1);

    rmSync(file, { recursive: true });

    trace('written');

    const html = readFileSync(file, 'utf8');
    const items = JSON.parse(
      html.match(
        /<script type="application\/json" id="traces">(.*?)<\/script>/s,
      )[1],
    );

    expect(items.map((item) => item.trace.name)).toEqual([
      'written',
      'failed again',
      'failed',
    ]);

    rmSync(dir, { recursive: true, force: true });
  });
});
