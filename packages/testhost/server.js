#!/usr/bin/env node

/**
The server script runs a testhost on a local port until the process is interrupted.

The test views in the views directory are served at /views/{view}/. The root redirects to the testview.

The database is in memory and discarded when the process stops.

@example
pnpm testview
pnpm testview --port=3002
pnpm testview --query-delay=1000
pnpm testview --workspace=apps/mapp/tests/workspaces/_workspace.json
*/

import { resolve } from 'node:path';
import process from 'node:process';
import { DEFAULT_WORKSPACE, startHost } from './index.js';

function arg(name) {
  return process.argv
    .find((arg) => arg.startsWith(`--${name}=`))
    ?.split('=')[1];
}

const port = Number(arg('port') ?? process.env.TESTHOST_PORT ?? 3001);

const queryDelay = Number(
  arg('query-delay') ?? process.env.TESTHOST_QUERY_DELAY ?? 0,
);

const workspaceArg = arg('workspace') ?? process.env.TESTHOST_WORKSPACE;

const workspace = workspaceArg
  ? resolve(process.env.INIT_CWD ?? process.cwd(), workspaceArg)
  : DEFAULT_WORKSPACE;

let host;

try {
  host = await startHost({ port, queryDelay, workspace });
} catch (err) {
  console.error(`The testhost failed to start: ${err.message}`);
  process.exit(1);
}

console.log(`The testhost is running on ${host.url}

Testview: ${host.url}/views/testview/
Workspace: ${workspace}
Devdb: ${host.devdb.connectionString}

Press Ctrl+C to stop.`);

async function shutdown() {
  await host.stop();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
