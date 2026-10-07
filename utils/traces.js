#!/usr/bin/env node

/**
## utils/traces

Fetches the request traces logged by the ConsoleTraceProcessor (OTEL_TRACES_EXPORTER=console) from the Vercel runtime logs with the `vercel logs --json` CLI command.

Each trace is printed as a waterfall in the terminal. The --html flag writes a report with a request list, the span waterfall, span details, and a summary of the time by span name.

The Vercel CLI must be installed, logged in, and the directory must be linked to the Vercel project, or the --project and --scope flags must be provided.
*/

import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { traceReport } from '../apps/xyz/mod/utils/traceReport.js';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`Usage: pnpm traces [deploymentId|url] [options]

  Fetches the request traces logged with OTEL_TRACES_EXPORTER=console from the Vercel runtime logs.

  Options:
    --html[=file]         Write an HTML report. Defaults to .traces/traces-<time>.html
    --open                Open the HTML report in the browser.
    --list                Print one line per trace without the waterfall.
    --depth <n>           Only print spans to the depth in the waterfall.
    --min-duration <ms>   Only show traces which take at least the duration.

  Options passed to vercel logs:
    --since, --until, --query, --request-id, --status-code, --environment,
    --deployment, --branch, --limit, --project, --scope, --token, --follow

  Examples:
    pnpm traces --since 1h
    pnpm traces --since 1h --min-duration 500 --html --open
    pnpm traces --query "/api/query" --status-code 5xx --list
    pnpm traces --follow --environment preview`);
  process.exit(0);
}

const options = {
  html: getArg('html') ?? (args.includes('--html') ? true : undefined),
  open: args.includes('--open'),
  list: args.includes('--list'),
  depth: Number(getArg('depth')) || Number.POSITIVE_INFINITY,
  minDuration: Number(getArg('min-duration')) || 0,
  follow: args.includes('--follow') || args.includes('-f'),
};

const VERCEL_FLAGS_WITH_VALUES = new Set([
  '--since',
  '--until',
  '--query',
  '-q',
  '--request-id',
  '--status-code',
  '--environment',
  '--deployment',
  '-d',
  '--branch',
  '-b',
  '--limit',
  '-n',
  '--project',
  '-p',
  '--scope',
  '-S',
  '--token',
  '-t',
  '--level',
  '--source',
]);

const VERCEL_FLAGS = new Set(['--follow', '-f', '--no-color', '--debug']);

const OWN_FLAGS_WITH_VALUES = new Set(['--depth', '--min-duration']);

const color =
  process.stdout.isTTY && !process.env.NO_COLOR
    ? (code, text) => `\x1b[${code}m${text}\x1b[0m`
    : (_, text) => text;

// ANSI colours by span category. The colours match the categories of the HTML report.
const CATEGORIES = [
  { code: 90, test: (name, depth) => depth === 0 },
  { code: 34, test: (name) => name.startsWith('workspace.') },
  {
    code: 33,
    test: (name) =>
      name === 'getSrc' || name.startsWith('src.') || name === 'cacheSources',
  },
  { code: 32, test: (name) => name.startsWith('dbs.') },
  { code: 35, test: (name) => name.startsWith('template.') },
];

const traces = [];
const seen = new Set();

const vercel = spawnVercel(['logs', '--json', ...vercelArgs(args)]);

let stderr = '';

vercel.stderr.on('data', (chunk) => {
  stderr += chunk;
});

createInterface({ input: vercel.stdout }).on('line', (line) => {
  for (const item of extractTraces(line)) {
    if (options.follow) {
      printTrace(item);
    } else {
      traces.push(item);
    }
  }
});

vercel.on('close', (code) => {
  if (code !== 0 && !traces.length) {
    process.stderr.write(stderr || `vercel logs exited with code ${code}\n`);
    process.exit(code || 1);
  }

  if (options.follow) return;

  if (!traces.length) {
    console.log(
      'No traces found. Traces are logged with OTEL_TRACES_EXPORTER=console in the Vercel environment.',
    );
    return;
  }

  // Oldest first in the terminal so the newest trace is printed last.
  traces.sort((a, b) => a.meta.timestamp - b.meta.timestamp);

  traces.forEach(printTrace);

  console.log(color(90, `\n${traces.length} traces`));

  if (options.html) writeReport(traces);
});

/**
@function extractTraces

@description
Parses a JSON line from vercel logs and returns the traces logged in the log entry. A log entry may have multiple log messages in the logs array.

Traces are identified by their traceId and are only returned once.

@param {string} line JSON line from vercel logs --json.
@returns {Array<Object>} Traces with the Vercel log meta.
*/
function extractTraces(line) {
  if (!line.startsWith('{')) return [];

  let entry;

  try {
    entry = JSON.parse(line);
  } catch {
    return [];
  }

  const messages = [
    entry.message,
    ...(entry.logs ?? []).map((log) => log.message),
  ];

  const items = [];

  for (const message of messages) {
    if (typeof message !== 'string' || !message.includes('"traceId"')) continue;

    let trace;

    try {
      trace = JSON.parse(message);
    } catch {
      console.warn(
        color(
          33,
          `Skipped a trace which could not be parsed (${message.length} characters). The log message may have been truncated.`,
        ),
      );
      continue;
    }

    if (!trace.traceId || typeof trace.duration !== 'number') continue;

    if (seen.has(trace.traceId)) continue;

    seen.add(trace.traceId);

    if (trace.duration < options.minDuration) continue;

    items.push({
      trace,
      meta: {
        source: 'Vercel',
        timestamp: entry.timestamp,
        deploymentId: entry.deploymentId,
        environment: entry.environment,
        domain: entry.domain,
        requestPath: entry.requestPath,
        responseStatusCode: entry.responseStatusCode,
      },
    });
  }

  return items;
}

/**
@function printTrace

@description
Prints the trace header and the span waterfall to the terminal.

@param {Object} item Trace with the Vercel log meta.
*/
function printTrace({ trace, meta }) {
  const header = traceHeader(trace, meta);

  if (options.list) {
    console.log(header);
    return;
  }

  console.log(`\n${header}`);

  printWaterfall(trace);

  const top = Object.entries(trace.summary ?? {})
    .sort((a, b) => b[1].duration - a[1].duration)
    .slice(0, 5)
    .map(([name, s]) => `${name} ${fmt(s.duration)} ×${s.count}`);

  if (top.length) console.log(color(90, `top: ${top.join(' · ')}`));
}

/**
@function traceHeader

@description
Returns the one line header for the trace with the time, status, duration, path, cold start, and workspace cache.

@param {Object} trace
@param {Object} meta The Vercel log meta.
@returns {string} The trace header.
*/
function traceHeader(trace, meta) {
  const attrs = trace.attributes ?? {};
  const status = meta.responseStatusCode ?? attrs['http.response.status_code'];
  const time = meta.timestamp
    ? new Date(meta.timestamp).toLocaleTimeString()
    : '';

  return [
    color(90, time),
    color(status >= 500 ? 31 : status >= 400 ? 33 : 32, status ?? '–'),
    color(1, fmt(trace.duration).padStart(9)),
    meta.requestPath ?? attrs['url.path'] ?? trace.name,
    attrs['faas.coldstart'] ? color(33, 'cold') : '',
    attrs['xyz.workspace.cache']
      ? color(33, `cache:${attrs['xyz.workspace.cache']}`)
      : '',
  ]
    .filter(Boolean)
    .join('  ');
}

/**
@function printWaterfall

@description
Prints one row per span with the tree prefix, span name, bar, and duration. Bars are drawn to scale of the trace duration in the terminal width.

@param {Object} trace
*/
function printWaterfall(trace) {
  const rows = flatten(trace);
  const hasStart = rows.some((row) => typeof row.node.start === 'number');
  const shown = rows.filter((row) => row.depth <= options.depth);

  // The row label is the tree prefix, span name, and span key.
  const labels = shown.map(({ node, prefix }) => {
    const key = spanKey(node);
    return {
      prefix,
      name: node.name,
      text: `${prefix}${node.name}${key ? ` ${key}` : ''}`,
    };
  });

  const columns = process.stdout.columns || 120;
  const nameWidth = Math.min(
    Math.max(32, Math.floor(columns * 0.4)),
    Math.max(...labels.map((label) => label.text.length)),
  );
  const barWidth = Math.max(20, columns - nameWidth - 14);

  const origin = trace.start ?? 0;
  const total = Math.max(
    trace.duration,
    ...rows.map(
      (row) => (row.node.start ?? origin) - origin + row.node.duration,
    ),
  );

  shown.forEach(({ node, depth }, i) => {
    const { prefix, name } = labels[i];
    const text = truncate(labels[i].text, nameWidth).padEnd(nameWidth);
    const nameEnd = Math.min(text.length, prefix.length + name.length);

    // The tree prefix and span key are dimmed.
    const label =
      color(90, text.slice(0, prefix.length)) +
      text.slice(prefix.length, nameEnd) +
      color(90, text.slice(nameEnd));

    const start = hasStart ? (node.start ?? origin) - origin : 0;
    const code = CATEGORIES.find((c) => c.test(node.name, depth))?.code ?? 90;

    const bar = drawBar(start / total, node.duration / total, barWidth);

    console.log(
      `${label} ${color(code, bar)} ${fmt(node.duration).padStart(9)}${node.error ? color(31, ' !') : ''}`,
    );
  });

  if (shown.length < rows.length) {
    console.log(
      color(
        90,
        `${rows.length - shown.length} spans deeper than --depth ${options.depth} not shown`,
      ),
    );
  }

  if (!hasStart) {
    console.log(
      color(
        90,
        'The trace has no start times. Bars show durations only. Redeploy to log span start times.',
      ),
    );
  }
}

/**
@function drawBar

@description
Draws a bar in the width of characters. The start and length are fractions of the width. Block characters draw the end of the bar in eighths of a character.

@param {number} start Start as a fraction of the width.
@param {number} length Length as a fraction of the width.
@param {number} width Width in characters.
@returns {string} The bar padded to the width.
*/
function drawBar(start, length, width) {
  const offset = Math.min(width - 1, Math.floor(start * width));
  const eighths = Math.max(1, Math.round(length * width * 8));
  const full = Math.min(width - offset, Math.floor(eighths / 8));
  const partial = full < width - offset ? eighths % 8 : 0;

  const bar = '█'.repeat(full) + (partial ? ' ▏▎▍▌▋▊▉'[partial] : '');

  return (' '.repeat(offset) + bar).padEnd(width);
}

// Span attributes which identify what a span worked on, in order of precedence.
const KEY_ATTRIBUTES = [
  'xyz.layer',
  'xyz.locale',
  'xyz.key',
  'xyz.template',
  'xyz.src',
  'xyz.dbs',
];

/**
@function spanKey

@description
Returns the key of what the span worked on, eg. the layer key of a getLayer span. A src is shortened to its file name.

@param {Object} node Span node.
@returns {string} The span key or an empty string.
*/
function spanKey(node) {
  const attrs = node.attributes ?? {};
  const key = KEY_ATTRIBUTES.find((attr) => attrs[attr] !== undefined);

  if (!key) return '';

  return key === 'xyz.src'
    ? String(attrs[key]).split('/').at(-1)
    : String(attrs[key]);
}

// Depth first rows in start order with tree prefixes.
function flatten(node, depth = 0, prefix = '', last = true, rows = []) {
  rows.push({
    node,
    depth,
    prefix: depth ? prefix + (last ? '└ ' : '├ ') : '',
  });

  const children = [...(node.children ?? [])].sort(
    (a, b) => (a.start ?? 0) - (b.start ?? 0),
  );

  children.forEach((child, i) =>
    flatten(
      child,
      depth + 1,
      depth ? prefix + (last ? '  ' : '│ ') : '',
      i === children.length - 1,
      rows,
    ),
  );

  return rows;
}

/**
@function writeReport

@description
Writes the HTML report from the [traceReport module]{@link module:/utils/traceReport}. The report lists the newest trace first.

@param {Array<Object>} items Traces with the Vercel log meta.
*/
function writeReport(items) {
  const file = resolve(
    typeof options.html === 'string'
      ? options.html
      : `.traces/traces-${new Date().toISOString().replace(/[:.]/g, '-')}.html`,
  );

  mkdirSync(dirname(file), { recursive: true });

  writeFileSync(file, traceReport([...items].reverse()));

  console.log(`Report written to ${file}`);

  if (options.open) openFile(file);
}

function openFile(file) {
  const [command, commandArgs] =
    process.platform === 'win32'
      ? ['cmd', ['/c', 'start', '', file]]
      : [process.platform === 'darwin' ? 'open' : 'xdg-open', [file]];

  spawn(command, commandArgs, { stdio: 'ignore', detached: true }).unref();
}

/**
@function vercelArgs

@description
Returns the arguments which are passed to vercel logs. A positional deployment id or url is passed on.

@param {Array<string>} argv Process arguments.
@returns {Array<string>} Arguments for vercel logs.
*/
function vercelArgs(argv) {
  const passthrough = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const [flag] = arg.split('=', 1);
    const takesValue = arg === flag && argv[index + 1] !== undefined;

    if (VERCEL_FLAGS_WITH_VALUES.has(flag)) {
      passthrough.push(arg);
      if (takesValue) passthrough.push(argv[++index]);
      continue;
    }

    if (VERCEL_FLAGS.has(flag)) {
      passthrough.push(arg);
      continue;
    }

    if (OWN_FLAGS_WITH_VALUES.has(flag)) {
      if (takesValue) index += 1;
      continue;
    }

    if (
      flag === '--html' &&
      arg === flag &&
      argv[index + 1]?.endsWith('.html')
    ) {
      index += 1;
      continue;
    }

    // A positional deployment id or url.
    if (!arg.startsWith('-')) passthrough.push(arg);
  }

  return passthrough;
}

function spawnVercel(commandArgs) {
  // pnpm runs the vercel CLI installed in the workspace or globally.
  if (process.env.npm_execpath?.toLowerCase().includes('pnpm')) {
    return spawn(process.execPath, [
      process.env.npm_execpath,
      'exec',
      'vercel',
      ...commandArgs,
    ]);
  }

  return spawn(
    'vercel',
    process.platform === 'win32' ? commandArgs.map(quote) : commandArgs,
    { shell: process.platform === 'win32' },
  );
}

// Arguments are quoted for the Windows shell, eg. a query with spaces.
function quote(arg) {
  return /[\s"&|<>^]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg;
}

function getArg(name) {
  const flag = `--${name}`;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg.startsWith(`${flag}=`)) return arg.slice(flag.length + 1);

    if (arg === flag) {
      const next = args[index + 1];
      if (next === undefined || next.startsWith('-')) return undefined;
      if (name === 'html' && !next.endsWith('.html')) return undefined;
      return next;
    }
  }
}

function truncate(text, width) {
  return text.length > width ? `${text.slice(0, width - 1)}…` : text;
}

function fmt(ms) {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  if (ms >= 100) return `${ms.toFixed(0)} ms`;
  if (ms >= 10) return `${ms.toFixed(1)} ms`;
  return `${ms.toFixed(2)} ms`;
}
