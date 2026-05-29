import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function prepareVercelGcpCredentials(req) {
  if (!process.env.VERCEL) return;

  const oidcToken =
    getHeader(req, 'x-vercel-oidc-token') || process.env.VERCEL_OIDC_TOKEN;
  const audience = process.env.GCP_WORKLOAD_IDENTITY_PROVIDER;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;

  if (!oidcToken || !audience || !serviceAccountEmail) {
    throw new Error(
      'Missing Vercel OIDC bootstrap for Google Secret Manager. Expected x-vercel-oidc-token, GCP_WORKLOAD_IDENTITY_PROVIDER, and GCP_SERVICE_ACCOUNT_EMAIL.',
    );
  }

  const oidcTokenPath = join('/tmp', 'vercel-oidc-token');
  const credentialsPath = join('/tmp', 'gcp-wif-credentials.json');

  await writeFile(oidcTokenPath, oidcToken, { mode: 0o600 });
  await writeFile(
    credentialsPath,
    JSON.stringify({
      type: 'external_account',
      audience,
      subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
      token_url: 'https://sts.googleapis.com/v1/token',
      service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${serviceAccountEmail}:generateAccessToken`,
      credential_source: {
        file: oidcTokenPath,
      },
    }),
    { mode: 0o600 },
  );

  process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;
}

function getHeader(req, header) {
  if (typeof req.headers?.get === 'function') return req.headers.get(header);

  const value = req.headers?.[header];

  return Array.isArray(value) ? value[0] : value;
}
