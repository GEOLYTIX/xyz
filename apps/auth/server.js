/**
The auth server script imports the xyz app and extends the routes with custom/login and custom/verify routes.
*/

import process from 'node:process';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('../..', import.meta.url));

// The xyz app resolves built-in file references from XYZ_CWD when provided.
process.env.XYZ_CWD ??= workspaceRoot;

await import('@geolytix/xyz-app/mod/utils/processEnv.js');

const [{ default: app }, { default: registerAuthRoutes }] = await Promise.all([
  import('@geolytix/xyz-app/server'),
  import('./auth.js'),
]);

export default registerAuthRoutes(app);
