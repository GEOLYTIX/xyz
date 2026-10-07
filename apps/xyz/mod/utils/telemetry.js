/**
## /utils/telemetry 🔭
The telemetry module traces the XYZ process with [OpenTelemetry]{@link https://opentelemetry.io/docs/languages/js/}.

Tracing is disabled unless an exporter is configured with the standard OTEL_* process environment variables.

The lightweight @opentelemetry/api is a dependency and always loaded. The API is a no-op until a tracer provider is registered.

The OpenTelemetry SDK and OTLP exporter are optional dependencies. These packages are installed and deployed but only loaded into the process with a dynamic import when tracing is enabled. A process without tracing does not pay the cold start and memory cost of loading the SDK.

The span helpers call the wrapped method directly without creating a span while tracing is disabled.

```env
# Export spans to an OTLP/HTTP collector, eg. Jaeger, SigNoz, Grafana Tempo.
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
OTEL_EXPORTER_OTLP_HEADERS=authorization=Bearer 🤫

# Log one span tree object per request to the console instead.
OTEL_TRACES_EXPORTER=console

# Only log requests which take 500ms or longer to the console.
OTEL_CONSOLE_MIN_DURATION=500

# Write the most recent console traces to an HTML report in a local process.
OTEL_CONSOLE_HTML=.traces/local.html

# Optional
OTEL_SERVICE_NAME=xyz
OTEL_RESOURCE_ATTRIBUTES=deployment.environment.name=dev
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
OTEL_SDK_DISABLED=true
```

The optional environment variables are read by the OpenTelemetry SDK. Please refer to the [SDK configuration]{@link https://opentelemetry.io/docs/languages/sdk-configuration/} documentation for all available variables. The OTEL_TRACES_EXPORTER is read by the register method and only supports the otlp, console, and none values. The OTEL_CONSOLE_MIN_DURATION and OTEL_CONSOLE_HTML are specific to XYZ and only apply to the console exporter. The OTEL_CONSOLE_HTML is ignored in a Vercel deployment.

Every request which is not served as a static file is traced with a root span from the requestSpan middleware. The root span records the route, response status, process memory, and whether the request was the first request of the process (faas.coldstart).

Spans are flushed with the Vercel waitUntil method at the end of each request in a Vercel deployment since the function may be frozen once the response is sent.

@requires @opentelemetry/api
@requires node:crypto
@requires node:fs
@requires node:path

@module /utils/telemetry
*/

import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  context,
  createContextKey,
  INVALID_SPAN_CONTEXT,
  SpanKind,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';

const REQUEST_SPAN = createContextKey('xyz.request_span');

// Span helpers pass a non-recording span to the wrapped method while tracing is disabled.
const NOOP_SPAN = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);

// Identifies the process instance in the service.instance.id resource attribute.
const instanceId = randomBytes(3).toString('hex');

let tracer = trace.getTracer('xyz');

let enabled = false;

let coldstart = true;

let flush;

await register();

/**
@function register
@async

@description
The register method creates and registers a NodeTracerProvider if the OTEL_TRACES_EXPORTER or an OTEL_EXPORTER_OTLP endpoint is configured in the process environment.

The method returns before the SDK packages are dynamically imported if no exporter is configured or OTEL_SDK_DISABLED is true.

The process metadata is assigned as resource attributes. Resource attributes from the OTEL_RESOURCE_ATTRIBUTES and OTEL_SERVICE_NAME process environment take precedence.

Optional dependencies are skipped by an install with the --no-optional flag. Tracing remains disabled with a warning if an exporter is configured but the SDK packages cannot be imported.
*/
async function register() {
  if (process.env.OTEL_SDK_DISABLED === 'true') return;

  const exporterType =
    process.env.OTEL_TRACES_EXPORTER ||
    ((process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT) &&
      'otlp');

  if (!exporterType || exporterType === 'none') return;

  try {
    const { BatchSpanProcessor, NodeTracerProvider } = await import(
      '@opentelemetry/sdk-trace-node'
    );

    const {
      defaultResource,
      detectResources,
      envDetector,
      resourceFromAttributes,
    } = await import('@opentelemetry/resources');

    // The console processor logs one span tree per trace instead of one log per span.
    const spanProcessor =
      exporterType === 'console'
        ? new (await import('./telemetryConsole.js')).ConsoleTraceProcessor({
            minDuration: process.env.OTEL_CONSOLE_MIN_DURATION,
            // The local report path is relative to the workspace root. A Vercel function cannot write the report.
            html:
              process.env.OTEL_CONSOLE_HTML && !process.env.VERCEL
                ? resolve(
                    globalThis.xyzEnv?.XYZ_CWD ?? process.cwd(),
                    process.env.OTEL_CONSOLE_HTML,
                  )
                : undefined,
          })
        : new BatchSpanProcessor(
            new (
              await import('@opentelemetry/exporter-trace-otlp-http')
            ).OTLPTraceExporter(),
          );

    const resource = defaultResource()
      .merge(resourceFromAttributes(processAttributes()))
      .merge(detectResources({ detectors: [envDetector] }));

    const provider = new NodeTracerProvider({
      resource,
      spanProcessors: [spanProcessor],
    });

    // Registers the provider globally with the AsyncLocalStorage context manager.
    provider.register();

    tracer = provider.getTracer('xyz');

    if (process.env.VERCEL) {
      // Spans are flushed once the promise settles, eg. a span which ends after the response.
      const forceFlush = () => provider.forceFlush();
      flush = (promise = Promise.resolve()) =>
        waitUntil(promise.then(forceFlush, forceFlush));
    } else {
      process.once('SIGTERM', () => provider.shutdown());
    }

    enabled = true;
  } catch (err) {
    console.warn(`Telemetry: ${err.message}`);
  }
}

/**
@function processAttributes

@description
Returns the process metadata to be assigned as resource attributes on every span.

@returns {Object} Resource attributes.
*/
function processAttributes() {
  let version;

  try {
    version = JSON.parse(
      readFileSync(new URL('../../../../package.json', import.meta.url)),
    ).version;
  } catch {
    // The root package.json may not be deployed.
  }

  const attributes = {
    'service.name': 'xyz',
    'service.version': version,
    'service.instance.id': instanceId,
    'deployment.environment.name':
      process.env.VERCEL_ENV || process.env.APP_ENV || process.env.NODE_ENV,
    'process.pid': process.pid,
    'process.runtime.name': 'nodejs',
    'process.runtime.version': process.versions.node,
    'vcs.ref.head.revision': process.env.VERCEL_GIT_COMMIT_SHA,
    'xyz.dir': process.env.DIR,
  };

  if (process.env.VERCEL) {
    attributes['cloud.provider'] = 'vercel';
    attributes['cloud.region'] = process.env.VERCEL_REGION;
  }

  // Resource attributes must not be undefined.
  for (const key of Object.keys(attributes)) {
    if (attributes[key] === undefined || attributes[key] === '') {
      delete attributes[key];
    }
  }

  return attributes;
}

/**
@function withSpan

@description
The withSpan method calls the fn method within an active span. Spans created within the fn method are children of the span.

The span is ended when the fn method resolves. The span status is set to error if the fn method throws or resolves to an Error. The XYZ API commonly returns rather than throws errors.

The fn method is called with a non-recording span if tracing is disabled.

@param {String} name The span name.
@param {Object} [attributes] Span attributes.
@param {Function} fn The method to call within the span. The span is provided as argument.
@returns {Promise} The fn method result.
*/
export function withSpan(name, attributes, fn) {
  if (!enabled) return fn(NOOP_SPAN);

  return tracer.startActiveSpan(
    name,
    { attributes: cleanAttributes(attributes) },
    async (span) => {
      try {
        const result = await fn(span);

        if (result instanceof Error) errorStatus(span, result);

        return result;
      } catch (err) {
        span.recordException(err);
        errorStatus(span, err);
        throw err;
      } finally {
        span.end();
      }
    },
  );
}

/**
@function activeSpan

@description
Returns the active span or a non-recording span if no span is active.

@returns {Span} The active span.
*/
export function activeSpan() {
  return trace.getActiveSpan() ?? NOOP_SPAN;
}

/**
@function setRequestAttributes

@description
Assigns attributes to the root span of the current request. Attributes on the root span allow requests to be grouped by eg. the query template or workspace key.

@param {Object} attributes Span attributes.
*/
export function setRequestAttributes(attributes) {
  if (!enabled) return;

  context
    .active()
    .getValue(REQUEST_SPAN)
    ?.setAttributes(cleanAttributes(attributes));
}

/**
@function requestSpan

@description
The requestSpan middleware creates a root span for the request. The root span is set as the active span for the remaining middleware and route handler.

The span name and http.route attribute are assigned from the matched express route once the response is closed.

The faas.coldstart attribute is true for the first request of the process.

@param {req} req HTTP request.
@param {res} res HTTP response.
@param {Function} next Next middleware.
*/
export function requestSpan(req, res, next) {
  if (!enabled) return next();

  const span = tracer.startSpan(req.method, {
    kind: SpanKind.SERVER,
    attributes: {
      'faas.coldstart': coldstart,
      'http.request.method': req.method,
      'url.path': req.path,
      'process.uptime': process.uptime(),
    },
  });

  coldstart = false;

  res.once('close', () => {
    const route = req.route?.path;

    if (route) {
      span.updateName(`${req.method} ${route}`);
      span.setAttribute('http.route', route);
    }

    span.setAttribute('http.response.status_code', res.statusCode);

    if (res.statusCode >= 500) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    }

    const memory = process.memoryUsage();

    span.setAttributes({
      'process.memory.rss': memory.rss,
      'process.memory.heap_used': memory.heapUsed,
      'process.memory.external': memory.external,
    });

    span.end();

    flush?.();
  });

  context.with(
    trace.setSpan(context.active(), span).setValue(REQUEST_SPAN, span),
    next,
  );
}

/**
@function srcAttribute

@description
Returns the src reference without query string to prevent keys and signatures being recorded in span attributes.

@param {String} src Source reference.
@returns {String} Source reference without query string.
*/
export function srcAttribute(src) {
  return typeof src === 'string' ? src.split('?')[0] : undefined;
}

/**
@function flushAfter

@description
Keeps a Vercel function alive until the promise settles and flushes the spans afterwards. The response is not delayed.

The request span is flushed when the response is closed. A span which ends after the response, eg. a nonblocking query, would not be exported if the function is frozen before the next flush.

The method is a no-op unless tracing is enabled in a Vercel deployment. It must be called within the request, eg. when the nonblocking query is started.

@param {Promise} promise The promise of a span which may end after the response.
*/
export function flushAfter(promise) {
  flush?.(promise);
}

/**
@function waitUntil

@description
Keeps a Vercel function alive until the promise settles, after the response has been sent.

The method is an inline copy of the waitUntil method from the [@vercel/functions]{@link https://www.npmjs.com/package/@vercel/functions} package (v3.9). The Vercel runtime exposes the request context on the global @vercel/request-context symbol. This is an undocumented implementation detail of the Vercel runtime.

If Vercel changes how the request context is exposed, spans will silently no longer be flushed in Vercel deployments. The @vercel/functions dependency must then be added and its waitUntil method imported in place of this method.

The method is a no-op outside of a Vercel request context.

@param {Promise} promise The promise to wait for.
*/
function waitUntil(promise) {
  globalThis[Symbol.for('@vercel/request-context')]
    ?.get?.()
    ?.waitUntil?.(promise);
}

function errorStatus(span, err) {
  span.setStatus({ code: SpanStatusCode.ERROR, message: err?.message });
}

// Span attribute values must be primitive. Request params may be parsed as arrays or objects.
const ATTRIBUTE_TYPES = new Set(['string', 'number', 'boolean']);

function cleanAttributes(attributes = {}) {
  const clean = {};

  for (const [key, value] of Object.entries(attributes)) {
    if (!ATTRIBUTE_TYPES.has(typeof value)) continue;
    clean[key] = value;
  }

  return clean;
}

/**
@function registerTracerProvider

@description
Enables tracing with a tracer from the provided tracer provider. The method is used to test spans with an in-memory exporter.

@param {TracerProvider} provider A registered tracer provider.
*/
export function registerTracerProvider(provider) {
  tracer = provider.getTracer('xyz');
  enabled = true;
}
