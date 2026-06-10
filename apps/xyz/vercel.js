import { setVercelOidcCredentials } from '../../utils/vercel-oidc.js';

let appPromise;

export default async function handler(req, res) {
  setVercelOidcCredentials(req);

  appPromise ??= import('./server.js').then(({ default: app }) => app);
  const app = await appPromise;

  return app(req, res);
}
