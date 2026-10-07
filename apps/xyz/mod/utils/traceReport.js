/**
## /utils/traceReport

The traceReport module creates a standalone HTML report for traces logged by the [ConsoleTraceProcessor]{@link module:/utils/telemetryConsole}.

The report has a request list, the span waterfall, span details, and a summary of the time by span name. The traces are injected into the traceReport.html template.

The report is written by the ConsoleTraceProcessor with the OTEL_CONSOLE_HTML process environment variable in a local process, and by the `pnpm traces --html` script for traces fetched from the Vercel runtime logs.

@requires node:fs

@module /utils/traceReport
*/

import { readFileSync } from 'node:fs';

const PLACEHOLDER = '<script type="application/json" id="traces">[]</script>';

let template;

/**
@function traceReport

@description
Returns the HTML report with the traces injected into the report template. The request list in the report follows the order of the items.

The JSON is escaped to prevent a </script> sequence in a trace from closing the script element.

@param {Array<Object>} items Traces with log meta.
@property {Object} item.trace The logged trace.
@property {Object} [item.meta] The log meta, eg. source, timestamp, requestPath, responseStatusCode.
@returns {string} The HTML report.
*/
export function traceReport(items) {
  template ??= readFileSync(
    new URL('./traceReport.html', import.meta.url),
    'utf8',
  );

  if (!template.includes(PLACEHOLDER)) {
    throw new Error('The traces placeholder is missing in traceReport.html.');
  }

  const json = JSON.stringify(items).replaceAll('<', String.raw`<`);

  return template.replace(
    PLACEHOLDER,
    () => `<script type="application/json" id="traces">${json}</script>`,
  );
}
