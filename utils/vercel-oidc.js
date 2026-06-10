import { writeFileSync } from 'node:fs';

const tokenPath = '/tmp/vercel-oidc-token';

export function setVercelOidcCredentials(req) {
  const header = req.headers['x-vercel-oidc-token'];
  const token = Array.isArray(header) ? header[0] : header;

  if (typeof token !== 'string' || !token) return;

  process.env.VERCEL_OIDC_TOKEN = token;

  if (process.env.GOOGLE_CREDENTIALS) return;
  if (!process.env.GCP_WORKLOAD_IDENTITY_PROVIDER) return;

  writeFileSync(tokenPath, token, { mode: 0o600 });

  const credentials = {
    type: 'external_account',
    audience: process.env.GCP_WORKLOAD_IDENTITY_PROVIDER,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    credential_source: {
      file: tokenPath,
    },
  };

  if (process.env.GCP_SERVICE_ACCOUNT_EMAIL) {
    credentials.service_account_impersonation_url = `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${process.env.GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`;
  }

  process.env.GOOGLE_CREDENTIALS = JSON.stringify(credentials);
}
