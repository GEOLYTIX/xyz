/**
The auth server script imports the xyz app and extends the routes with custom/login and custom/verify routes.
*/

import process from 'node:process';
import { fileURLToPath } from 'node:url';
import express from 'express';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

// The xyz app resolves built-in file references from XYZ_CWD when provided.
process.env.XYZ_CWD ??= workspaceRoot;

await import('@geolytix/xyz-app/mod/utils/processEnv.js');

import createRouter from '@geolytix/xyz-app/router';

import rootRedirect from '../xyz/mod/middleware/rootRedirect.js';
import validateRequestAuth from '../xyz/mod/middleware/validateRequestAuth.js';
import validateRequestParams from '../xyz/mod/middleware/validateRequestParams.js';

const { custom_login, custom_logout, custom_verify } = await import(
  './customAuth.js'
);

const router = createRouter([
  rootRedirect,
  validateRequestParams,
  validateRequestAuth,
]);

router.get(`${xyzEnv.DIR}/custom/login`, custom_login);
router.get(`${xyzEnv.DIR}/custom/logout`, custom_logout);
router.post(
  `${xyzEnv.DIR}/custom/verify`,
  [express.urlencoded({ extended: true }), express.json({ limit: '5mb' })],
  custom_verify,
);

const app = express();
app.use(router);

app.disable('x-powered-by');

if (!process.env.VERCEL) {
  app.listen(xyzEnv.PORT);
}
