/**
## @geolytix/xyz-testhost

The testhost module runs a local XYZ host against an in-memory devdb PGlite database for browser tests and test views of the MAPP and MAPP.UI libraries.

The host serves the XYZ API with a workspace file, the MAPP library source modules, and the test views in the views directory.

| Path | Content |
|---|---|
| /views/{view} | The test views in packages/testhost/views. |
| /mapp/lib | The apps/mapp/lib source modules. |
| /mapp/css | The apps/mapp/css source stylesheets. |
| /api | The XYZ API with the host workspace. |

The xyzEnv and the dbs connection pools are created from the process.env when the XYZ modules are imported. The startHost method can therefore only be called once per process.

The package is excluded from Vercel deployments in the .vercelignore and must never be imported by application code.

@requires @geolytix/xyz-app
@requires @geolytix/xyz-devdb
@requires express

@module testhost
*/

import { relative } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { startDevDb } from '@geolytix/xyz-devdb';
import express from 'express';
import mvtEncode from './mvtEncode.js';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

export const VIEWS_DIR = fileURLToPath(new URL('./views', import.meta.url));

export const DEFAULT_WORKSPACE = fileURLToPath(
  new URL('./workspaces/testview.json', import.meta.url),
);

/**
The built bundles and stylesheets of the XYZ views with the source modules served by the testhost.
*/
export const SOURCE_MODULES = {
  '/public/js/lib/mapp.js': '/mapp/lib/mapp.mjs',
  '/public/js/lib/ui.js': '/ui/lib/ui.mjs',
  '/public/css/mapp.css': '/mapp/css/_mapp.css',
  '/public/css/ui.css': '/ui/css/_ui.css',
};

let started = false;

/**
@function startHost
@async

@description
The startHost method starts an in-memory devdb database and an express server with the XYZ API for the workspace file.

The workspace is read with the file provider relative to the repository root. Changes to the workspace file apply without a restart.

The devdb PostGIS is compiled without protobuf-c and cannot create vector tiles. The CUSTOM_TEMPLATES replace the core mvt query template with the [testhost mvt template](templates/mvt.js), and the [mvtEncode](mvtEncode.js) middleware encodes its rows as vector tile.

The queryDelay delays the response of /api/query requests by the given milliseconds. Delayed layer data with cached tiles tests that the mapview.renderComplete promise doesn't resolve before the layer data has loaded.

@param {Object} [options]
@property {string} [options.workspace] Absolute path of the workspace json file. Defaults to the testhost workspaces/testview.json.
@property {number} [options.port] Port for the express server. A free port is assigned if 0.
@property {number} [options.queryDelay] Milliseconds to delay /api/query responses.
@property {string} [options.title] The TITLE for the XYZ environment.
@property {boolean} [options.cors] Allow requests from any origin, eg. from the Vitest browser page.
@returns {Promise<Object>} The host url, port, devdb, and a stop method.
*/
export async function startHost({
  workspace = DEFAULT_WORKSPACE,
  port = 3001,
  queryDelay = 0,
  title = 'XYZ TESTHOST',
  cors = false,
} = {}) {
  if (started) {
    throw new Error('The testhost can only be started once per process.');
  }

  started = true;

  const devdb = await startDevDb({ port: 0 });

  // The file provider joins the src path with the XYZ_CWD.
  const workspaceSrc = relative(workspaceRoot, workspace).replaceAll('\\', '/');

  // The xyzEnv is created from the process.env when the processEnv module is imported.
  Object.assign(process.env, {
    DBS_DEVDB: devdb.connectionString,
    PORT: String(port),
    TITLE: title,
    WORKSPACE: `file:${workspaceSrc}`,
    WORKSPACE_AGE: '0',
    XYZ_CWD: workspaceRoot,
    // The devdb PostGIS cannot create vector tiles. The testhost mvt template returns the features for the mvtEncode middleware.
    CUSTOM_TEMPLATES: 'file:packages/testhost/templates/_templates.json',
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

  if (cors) {
    // The testhost has no authentication. Any origin may request the API.
    app.use((req, res, next) => {
      res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      });

      if (req.method === 'OPTIONS') return res.sendStatus(204);

      next();
    });
  }

  app.use('/views', express.static(VIEWS_DIR));

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

  app.use(
    '/ui/lib',
    express.static(
      fileURLToPath(new URL('../../apps/ui/lib', import.meta.url)),
    ),
  );

  app.use(
    '/ui/css',
    express.static(
      fileURLToPath(new URL('../../apps/ui/css', import.meta.url)),
    ),
  );

  // The XYZ views, eg. the default view at /view, load the built library bundles and stylesheets. The testhost redirects the bundle urls to the source modules, so the views run the current source without a build.
  app.get(Object.keys(SOURCE_MODULES), (req, res) =>
    res.redirect(SOURCE_MODULES[req.path]),
  );

  // The testview requires the locale and layers of the default workspace.
  app.get('/', (req, res) =>
    res.redirect(
      workspace === DEFAULT_WORKSPACE ? '/views/testview/' : '/views/locale/',
    ),
  );

  if (queryDelay > 0) {
    app.use('/api/query', (req, res, next) => setTimeout(next, queryDelay));
  }

  app.use('/api/query', mvtEncode);

  app.use(createRouter([validateRequestParams, validateRequestAuth]));

  let server;

  try {
    // Express 5 passes listen errors, eg. a port in use, to the callback.
    server = await new Promise((resolve, reject) => {
      const server = app.listen(port, '127.0.0.1', (err) =>
        err ? reject(err) : resolve(server),
      );
    });
  } catch (err) {
    await devdb.stop();
    throw err;
  }

  const assignedPort = server.address().port;

  return {
    url: `http://127.0.0.1:${assignedPort}`,
    port: assignedPort,
    devdb,
    stop: async () => {
      await new Promise((resolve) => server.close(resolve));
      await devdb.stop();
    },
  };
}
