#!/usr/bin/env node

/**
The testview server runs the XYZ API against an in-memory devdb PGlite database and serves a test view which creates mapviews with the MAPP library only.

The MAPP library is served from the apps/mapp source modules so that no build is required and individual modules can be imported by the view or by tests.

| Path | Content |
|---|---|
| /testview | The test view html and scripts. |
| /mapp/lib | The apps/mapp/lib source modules. |
| /mapp/css | The apps/mapp/css source stylesheets. |
| /api | The XYZ API with the testview workspace. |

The database is discarded when the process stops.

@example
pnpm testview
pnpm testview --port=3002
*/

import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { startDevDb } from '@geolytix/xyz-devdb';
import express from 'express';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

const port =
  process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] ??
  process.env.TESTVIEW_PORT ??
  '3001';

const devdb = await startDevDb({ port: 0 });

// The xyzEnv is created from the process.env when the processEnv module is imported.
Object.assign(process.env, {
  DBS_DEVDB: devdb.connectionString,
  PORT: port,
  TITLE: 'XYZ TESTVIEW',
  WORKSPACE: 'file:packages/testview/workspace.json',
  // Changes to the workspace.json apply without a restart.
  WORKSPACE_AGE: '0',
  XYZ_CWD: workspaceRoot,
});

await import('@geolytix/xyz-app/mod/utils/processEnv.js');

const { default: createRouter } = await import('@geolytix/xyz-app/router');

const { default: validateRequestAuth } = await import(
  '../../apps/xyz/mod/middleware/validateRequestAuth.js'
);
const { default: validateRequestParams } = await import(
  '../../apps/xyz/mod/middleware/validateRequestParams.js'
);

const app = express();

app.disable('x-powered-by');

app.use(
  '/testview',
  express.static(fileURLToPath(new URL('./view', import.meta.url))),
);

app.use(
  '/mapp/lib',
  express.static(
    fileURLToPath(new URL('../../apps/mapp/lib', import.meta.url)),
  ),
);

app.use(
  '/mapp/css',
  express.static(
    fileURLToPath(new URL('../../apps/mapp/css', import.meta.url)),
  ),
);

app.get('/', (req, res) => res.redirect('/testview/'));

app.use(createRouter([validateRequestParams, validateRequestAuth]));

// Express 5 passes listen errors, eg. a port in use, to the callback.
const server = app.listen(xyzEnv.PORT, async (err) => {
  if (err) {
    console.error(`The testview failed to start: ${err.message}`);
    await devdb.stop();
    process.exit(1);
  }

  console.log(`The testview is running on http://localhost:${xyzEnv.PORT}/testview/

The devdb is running on ${devdb.connectionString}

Press Ctrl+C to stop.`);
});

async function shutdown() {
  server.close();
  await devdb.stop();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
