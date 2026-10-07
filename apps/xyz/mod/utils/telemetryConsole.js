/**
## /utils/telemetryConsole

The telemetryConsole module exports the ConsoleTraceProcessor which logs one object per trace to the console.

The [telemetry module]{@link module:/utils/telemetry} registers the processor with the OTEL_TRACES_EXPORTER=console process environment variable.

A trace is logged once the root span of the trace ends. For a request the root span is the request span. The logged object has a summary of the count and total duration for each span name, and the span tree with nested children.

```js
{
  name: 'GET /api/workspace{/:key}',
  start: 0,
  duration: 41.2,
  attributes: { 'faas.coldstart': true, 'xyz.workspace.key': 'locale', ... },
  summary: {
    'workspace.getLocale': { count: 1, duration: 38.6 },
    'workspace.composeObj': { count: 12, duration: 30.1 },
  },
  children: [ { name: 'workspace.getLocale', start: 1.8, duration: 38.6, children: [...] } ]
}
```

Start times and durations are in milliseconds. The start of each span is relative to the start of the root span. The summary duration of nested spans with the same name will be counted more than once, eg. a nested getLocale.

Traces whose root span is shorter than the minDuration option are not logged. The [telemetry module]{@link module:/utils/telemetry} assigns the minDuration from the OTEL_CONSOLE_MIN_DURATION process environment variable, eg. 500 to only log requests which take 500ms or longer.

The trace is logged as indented JSON if the process output is an interactive terminal. Otherwise, eg. in Vercel runtime logs, every trace is logged as a single line of JSON.

Spans which end after their root span, eg. a nonblocking query, are logged on their own if their trace was logged.

The resource attributes with the process metadata are only logged with the first trace of the process.

With the html option every logged trace is also written to an HTML report file with the most recent traces. The [telemetry module]{@link module:/utils/telemetry} assigns the html option from the OTEL_CONSOLE_HTML process environment variable in a local process. Keep the report open in a browser and reload the page after a request.

@requires node:fs
@requires node:inspector
@requires node:path
@requires /utils/traceReport

@module /utils/telemetryConsole
*/

import { mkdirSync, writeFileSync } from 'node:fs';
import inspector from 'node:inspector';
import { dirname, resolve } from 'node:path';
import { traceReport } from './traceReport.js';

// Recently completed traces. Spans ending after their root span are logged on their own if the trace was logged.
const COMPLETED_LIMIT = 100;

// The number of most recent traces in the HTML report.
const REPORT_LIMIT = 50;

// The span startTime is recorded with Date.now() at millisecond precision. Precise start times are recorded with performance.now() when the span starts.
const startTimes = new WeakMap();

/**
@class ConsoleTraceProcessor

@description
A span processor which collects the ended spans of a trace and logs the span tree once the root span ends.
*/
export class ConsoleTraceProcessor {
  /**
  @param {Object} [options]
  @property {number} [options.minDuration=0] Traces whose root span is shorter than the minDuration in milliseconds are not logged.
  @property {string} [options.html] Path of an HTML report file which is written with the most recent logged traces.
  */
  constructor(options = {}) {
    this.minDuration = Number(options.minDuration) || 0;

    this.html = options.html ? resolve(options.html) : undefined;

    // Most recent logged traces for the HTML report, newest first.
    this.reportItems = [];

    // Report write errors which have been warned about.
    this.reportErrors = new Set();

    // Ended spans by traceId.
    this.traces = new Map();

    // Whether a completed trace was logged by traceId.
    this.completed = new Map();

    this.resourceLogged = false;
  }

  /**
  @function onStart

  @description
  Records the precise start time of the span.

  @param {Span} span The started span.
  */
  onStart(span) {
    startTimes.set(span, performance.now());
  }

  /**
  @function onEnd

  @description
  Collects the ended span. The trace is logged if the span is the root span of the trace and the root span duration is not shorter than the minDuration.

  @param {ReadableSpan} span The ended span.
  */
  onEnd(span) {
    const { traceId } = span.spanContext();

    if (this.completed.has(traceId)) {
      if (this.completed.get(traceId)) log(spanNode(span));
      return;
    }

    const spans = this.traces.get(traceId) ?? [];

    spans.push(span);

    if (span.parentSpanContext) {
      this.traces.set(traceId, spans);
      return;
    }

    this.traces.delete(traceId);

    const logTrace = hrTimeMs(span.duration) >= this.minDuration;

    this.completed.set(traceId, logTrace);

    if (this.completed.size > COMPLETED_LIMIT) {
      this.completed.delete(this.completed.keys().next().value);
    }

    if (!logTrace) return;

    const tree = traceTree(span, spans);

    // The process metadata is the same for every trace and only logged with the first logged trace.
    if (!this.resourceLogged && span.resource) {
      tree.resource = nullObject(span.resource.attributes);
      this.resourceLogged = true;
    }

    log(tree);

    if (this.html) this.writeReport(tree);
  }

  /**
  @function writeReport

  @description
  Adds the trace to the most recent traces and writes the HTML report file from the [traceReport module]{@link module:/utils/traceReport}. The report is written synchronously and is meant for a local process only.

  A failed write is retried with the next trace. The file may be locked for a moment on Windows while another process, eg. a live server, reads the file. Each distinct error is only warned about once.

  @param {Object} tree The logged trace.
  */
  writeReport(tree) {
    const attrs = tree.attributes ?? {};

    this.reportItems.unshift({
      trace: tree,
      meta: {
        source: 'Local',
        timestamp: Date.now(),
        requestPath: attrs['url.path'],
        responseStatusCode: attrs['http.response.status_code'],
      },
    });

    this.reportItems.length = Math.min(this.reportItems.length, REPORT_LIMIT);

    try {
      mkdirSync(dirname(this.html), { recursive: true });
      writeFileSync(this.html, traceReport(this.reportItems));
    } catch (err) {
      if (!this.reportErrors.has(err.message)) {
        this.reportErrors.add(err.message);
        console.warn(`Trace report: ${err.message}`);
      }
    }
  }

  forceFlush() {
    return Promise.resolve();
  }

  shutdown() {
    this.traces.clear();
    return Promise.resolve();
  }
}

/**
@function traceTree

@description
Creates the span tree for the root span. Children are sorted by their start time.

The summary counts the spans and sums their duration by span name.

@param {ReadableSpan} root The root span.
@param {Array<ReadableSpan>} spans All ended spans of the trace including the root span.
@returns {Object} The root span node with summary and nested children.
*/
export function traceTree(root, spans) {
  const nodes = new Map();

  // Span start times are relative to the start of the root span.
  const origin = startTime(root);

  for (const span of spans) {
    nodes.set(span.spanContext().spanId, {
      span,
      node: spanNode(span, origin),
    });
  }

  const summary = Object.create(null);

  for (const { span, node } of nodes.values()) {
    if (span !== root) {
      summary[node.name] ??= nullObject({ count: 0, duration: 0 });
      summary[node.name].count++;
      summary[node.name].duration = round(
        summary[node.name].duration + node.duration,
      );
    }

    const parent = nodes.get(span.parentSpanContext?.spanId);

    // Spans whose parent has not ended are assigned to the root span.
    if (span !== root) {
      (parent?.node ?? nodes.get(root.spanContext().spanId).node).children.push(
        node,
      );
    }
  }

  for (const { node } of nodes.values()) {
    node.children.sort((a, b) => a.start - b.start);
  }

  const rootNode = nodes.get(root.spanContext().spanId).node;

  return nullObject({
    traceId: root.spanContext().traceId,
    ...rootNode,
    summary,
  });
}

/**
@function spanNode

@description
Creates a compact node for the span. Empty properties are omitted.

The start is the time in milliseconds from the origin, eg. the start of the root span. The start of a span logged on its own is 0.

@param {ReadableSpan} span
@param {number} [origin] The origin time in milliseconds. Defaults to the span start time.
@returns {Object} Span node.
*/
function spanNode(span, origin = startTime(span)) {
  const node = nullObject({
    name: span.name,
    start: round(startTime(span) - origin),
    duration: hrTimeMs(span.duration),
  });

  if (Object.keys(span.attributes).length) {
    node.attributes = nullObject(span.attributes);
  }

  if (span.status?.code === 2) {
    node.error = span.status.message ?? true;
  }

  if (span.events?.length) {
    node.events = span.events.map((event) =>
      nullObject({
        name: event.name,
        ...event.attributes,
      }),
    );
  }

  node.children = [];

  return node;
}

/**
@function log

@description
Logs the node with console.log, which is patched by varlock to redact sensitive values.

The node object is logged as is while a debugger is attached so the object can be expanded in the debug console. Otherwise the node is logged as a JSON string, since nested objects would be truncated as [Object] in the terminal. JSON is used instead of util.inspect which prefixes every object without prototype with [Object: null prototype].

The JSON is indented for an interactive terminal. Log output which is not a terminal, eg. Vercel runtime logs or a log drain, gets one line of JSON per trace.

@param {Object} node The span node to log.
*/
function log(node) {
  pruneChildren(node);

  if (inspector.url()) {
    console.log(node);
    return;
  }

  console.log(JSON.stringify(node, null, process.stdout.isTTY ? 2 : 0));
}

// Empty children arrays are removed from the logged nodes.
function pruneChildren(node) {
  if (!node.children?.length) {
    delete node.children;
    return;
  }

  node.children.forEach(pruneChildren);
}

/**
@function nullObject

@description
Assigns the properties to an object created without prototype. The logged objects are plain data and expanding a logged object in the debug console does not show the Object prototype.

@param {Object} properties
@returns {Object} Object with null prototype.
*/
function nullObject(properties) {
  return Object.assign(Object.create(null), properties);
}

/**
@function startTime

@description
Returns the precise start time recorded by the onStart method. The span startTime is used for spans which have not been started with the processor.

@param {ReadableSpan} span
@returns {number} Start time in milliseconds.
*/
function startTime(span) {
  return startTimes.get(span) ?? hrTimeMs(span.startTime);
}

function hrTimeMs([seconds, nanos]) {
  return round(seconds * 1e3 + nanos / 1e6);
}

function round(ms) {
  return Math.round(ms * 100) / 100;
}
