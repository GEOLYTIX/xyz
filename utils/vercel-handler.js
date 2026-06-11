import { createRequire } from 'node:module';
import { setVercelOidcCredentials } from './vercel-oidc.js';

// Vercel traces dependencies from code, but Varlock resolves the GSM plugin
// declared in .env.schema from node_modules at runtime, walking up from the
// schema directory. Resolving the package entry from this root-level module
// makes the tracer include the root node_modules path without executing the
// plugin here.
const require = createRequire(import.meta.url);
require.resolve('@varlock/google-secret-manager-plugin/plugin');

/**
Creates a Vercel function handler which bootstraps env credentials before
lazily importing the express app.

Varlock resolves .env.schema once, on the first import of processEnv.js. The
handler must therefore set APP_ENV and the Google external-account
credentials before the app module is imported.

@param {Function} importApp Thunk returning the dynamic import of the app
module, e.g. () => import('./server.js').
@returns {Function} Vercel request handler.
*/
export function createVercelHandler(importApp) {
  let appPromise;

  return async function handler(req, res) {
    // Varlock's @currentEnv=$APP_ENV must resolve the Vercel target
    // environment (production/preview/development) rather than the schema's
    // local development default.
    process.env.APP_ENV ??= process.env.VERCEL_ENV;

    setVercelOidcCredentials(req);

    if (!appPromise) {
      // Importing the app without credentials would resolve varlock's GSM
      // plugin unauthenticated and poison the ESM module cache for the
      // lifetime of the instance. Shed the request instead; OIDC-enabled
      // deployments carry the token on subsequent requests.
      if (
        process.env.GCP_WORKLOAD_IDENTITY_PROVIDER &&
        !process.env.GOOGLE_CREDENTIALS
      ) {
        res.statusCode = 503;
        res.setHeader('Retry-After', '1');
        return res.end('Vercel OIDC token unavailable.');
      }

      appPromise = importApp().then(({ default: app }) => app);
    }

    let app;
    try {
      app = await appPromise;
    } catch (err) {
      // Do not cache a rejected import; a transient cold start failure (eg.
      // GSM timeout) must not brick the warm instance.
      appPromise = undefined;
      throw err;
    }

    return app(req, res);
  };
}
