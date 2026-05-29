import { prepareVercelGcpCredentials } from '../mod/utils/vercelGcpCredentials.js';

let apiPromise;

export default async function handler(req, res) {
  // Varlock loads during API import, so Vercel OIDC must be bridged first.
  await prepareVercelGcpCredentials(req);

  const { default: api } = await (apiPromise ??= import('./api.js'));

  return api(req, res);
}
