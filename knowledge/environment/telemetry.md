---
type: Environment Variable
title: Telemetry (OTEL_*)
description: OTEL_* variables enable OpenTelemetry tracing of XYZ API requests and select the exporter.
resource: ../../apps/xyz/mod/utils/telemetry.js
tags: [xyz, environment, telemetry, performance]
status: draft
variables: [OTEL_*]
sources:
  - resource: ../../apps/xyz/mod/utils/telemetry.js
  - resource: ../../apps/xyz/mod/utils/telemetryConsole.js
  - resource: ../../apps/xyz/mod/utils/traceReport.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/tests/mod/utils/telemetry.test.mjs
  - resource: ../../apps/xyz/tests/mod/utils/telemetryConsole.test.mjs
  - resource: ../../apps/xyz/tests/mod/utils/telemetryVercel.test.mjs
---
# Telemetry (OTEL_*)

Tracing is off by default. The telemetry module registers a tracer provider
when the router first imports it, and only if an exporter is configured. While
tracing is disabled the span helpers pass a non-recording span, so instrumented
code runs unchanged. The OpenTelemetry SDK packages are optional dependencies
and are only imported when tracing is enabled.

## Enabling tracing

| Variable | Effect |
|---|---|
| `OTEL_SDK_DISABLED` | `true` disables tracing whatever else is set. |
| `OTEL_TRACES_EXPORTER` | `otlp`, `console`, `html` or `none`. |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP/HTTP collector, eg. `http://localhost:4318`. Selects `otlp` when no exporter is set. |
| `OTEL_EXPORTER_OTLP_TRACES_ENDPOINT` | Traces-specific endpoint which takes precedence over the general one. |

With neither an exporter nor an endpoint, or with `none`, tracing stays off.
`console` and `html` use XYZ's console trace processor. Any other exporter value
uses the batched OTLP/HTTP exporter. If the SDK packages cannot be imported, eg.
after an install without optional dependencies, tracing stays off with a
warning.

## XYZ-specific variables

These are read by XYZ, not by the OpenTelemetry SDK:

- `OTEL_CONSOLE_MIN_DURATION` skips logging traces whose root span is shorter
  than this many milliseconds.
- `OTEL_CONSOLE_HTML` writes the most recent traces to an HTML report, resolved
  relative to `XYZ_CWD`, eg. `.traces/local.html`. The `html` exporter writes
  only the report, to `.traces/local.html` by default, without console output.
  The report is not written in a Vercel deployment, where `html` logs to the
  console like `console`.

## SDK variables

The SDK reads the standard variables itself, including
`OTEL_EXPORTER_OTLP_HEADERS`, `OTEL_SERVICE_NAME` (XYZ's default is `xyz`),
`OTEL_RESOURCE_ATTRIBUTES`, `OTEL_TRACES_SAMPLER` and `OTEL_TRACES_SAMPLER_ARG`.
Resource attributes from the environment take precedence over the process
metadata XYZ assigns. See the
[SDK configuration](https://opentelemetry.io/docs/languages/sdk-configuration/)
for the full list.

```dotenv
OTEL_TRACES_EXPORTER=console
OTEL_CONSOLE_MIN_DURATION=500
```

Keep collector credentials in `OTEL_EXPORTER_OTLP_HEADERS` out of committed
environment files. In a Vercel deployment spans are flushed at the end of each
request; elsewhere the provider shuts down on `SIGTERM`.
