## Environment Configuration

XYZ uses Varlock to validate environment variables before they are loaded by the application. The committed root `.env.schema` is a single flat file which declares every environment key the application understands, with root decorators for the current environment selection, production env encryption, and the Google Secret Manager plugin.

Commit the schema file, but do not commit deployment-specific `.env` files. Local secrets should stay in `.env.local`, which Varlock auto-loads and this repository ignores.

Schema entries are declarations, not defaults. Varlock injects declared keys without a value as empty strings, so server defaults must remain in `apps/xyz/mod/utils/processEnv.js`, where `||=` fallbacks apply after Varlock has loaded the environment. Do not add default values to `.env.schema` for keys which processEnv.js defaults conditionally, eg. `SECRET_ALGORITHM`.

Database connection variables use the `DBS_` prefix. Varlock schemas validate named variables rather than an open-ended `DBS_*` wildcard, so declare each concrete `DBS_` key a deployment uses at the end of `.env.schema`:

```env
# @type=string
DBS_CLIENT=

# @type=string
DBS_REPORTING=
```

The actual values belong in `.env`, `.env.local`, or the deployment platform configuration:

```env
PORT=3000
SECRET=gsm("xyz-secret")
DBS_NEON=gsm("dbs-neon")
WORKSPACE=gsm("xyz-workspace")
SAML_ACS=https://example.com/saml/acs
SAML_SSO=https://idp.example.com/saml/login
SAML_ENTITY_ID=xyz-example
SAML_SP_CRT=sp_certificate
SAML_IDP_CRT=idp_certificate
```

For local development, Varlock resolves Google Secret Manager values with Google Application Default Credentials. Authenticate with `gcloud`, then set `GCP_PROJECT_ID` in your local `.env.local` file:

```sh
gcloud auth application-default login
```

```env
GCP_PROJECT_ID=your-gcp-project-id
```

The preferred Vercel deployment flow freezes resolved values before the deployment, so serverless functions never resolve secrets at runtime — see [Frozen environment deployments](#frozen-environment-deployments) below. The following OIDC Workload Identity Federation setup enables the runtime-resolution fallback, where serverless functions resolve `gsm()` references directly without a service-account JSON key stored in Vercel.

Enable the required Google APIs:

```sh
gcloud services enable secretmanager.googleapis.com iamcredentials.googleapis.com sts.googleapis.com \
  --project=PROJECT_ID
```

Create the service account that Varlock will impersonate:

```sh
gcloud iam service-accounts create varlock-secrets \
  --project=PROJECT_ID \
  --display-name="Varlock Secret Manager access"
```

Grant it access to read secrets:

```sh
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:varlock-secrets@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

Create a Workload Identity Pool and Vercel OIDC provider. Vercel recommends the team-specific issuer mode, configured in the project Security settings:

```sh
gcloud iam workload-identity-pools create varlock-pool \
  --project=PROJECT_ID \
  --location=global

gcloud iam workload-identity-pools providers create-oidc vercel \
  --project=PROJECT_ID \
  --location=global \
  --workload-identity-pool=varlock-pool \
  --issuer-uri=https://oidc.vercel.com/VERCEL_TEAM_SLUG \
  --allowed-audiences=https://vercel.com/VERCEL_TEAM_SLUG \
  --attribute-mapping="google.subject=assertion.sub"
```

If the Vercel project uses global issuer mode, use `--issuer-uri=https://oidc.vercel.com` instead.

Allow the Vercel project/environment identity to impersonate the service account:

```sh
gcloud iam service-accounts add-iam-policy-binding \
  varlock-secrets@PROJECT_ID.iam.gserviceaccount.com \
  --project=PROJECT_ID \
  --role=roles/iam.workloadIdentityUser \
  --member="principal://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/varlock-pool/subject/owner:VERCEL_TEAM_SLUG:project:VERCEL_PROJECT_NAME:environment:production"
```

Repeat the binding for `environment:preview` or `environment:development` if those deployments should also access Google Secret Manager.

Set these non-secret bootstrap variables in Vercel:

```env
GCP_PROJECT_ID=PROJECT_ID
GCP_WORKLOAD_IDENTITY_PROVIDER=//iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/varlock-pool/providers/vercel
GCP_SERVICE_ACCOUNT_EMAIL=varlock-secrets@PROJECT_ID.iam.gserviceaccount.com
```

Keep `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT_EMAIL` empty locally so Varlock uses Application Default Credentials.

Vercel Functions expose the OIDC token on the `x-vercel-oidc-token` request header, not as a runtime environment variable. The shared `utils/vercel-handler.js` handler factory used by `apps/{xyz,auth,saml}/vercel.js` writes that header to a temporary subject-token file via `utils/vercel-oidc.js` and sets `GOOGLE_CREDENTIALS` to an external-account credentials configuration before the app module imports Varlock. The token file is refreshed whenever a request carries a new token, because google-auth re-reads it when its cached STS token expires. Varlock's GSM plugin then resolves `gsm()` values through the workload identity federation exchange.

The handler also sets `APP_ENV` from Vercel's `VERCEL_ENV` (production/preview/development) before Varlock loads, so the schema's `@currentEnv=$APP_ENV` resolves the deployment target without requiring `APP_ENV` in the Vercel project settings.

The `.env.production` file holds `gsm()` references for production deployments. It is intentionally untracked (`.gitignore` excludes `.env.*` except the schema), so production deployments must run through the Vercel CLI from a checkout which contains `.env.production` — a git-triggered Vercel build will not include it.

## Frozen environment deployments

The preferred deployment flow resolves and validates the environment once, before the deployment, and freezes the resolved values into a `.varlock.blob` file:

```sh
pnpm freeze-env --env=production
vercel --prod
```

The freeze script resolves `gsm()` references with the deploying machine's Application Default Credentials and validates the configuration against the schema — an invalid configuration fails the deployment instead of the first serverless invocation. The blob ships with the function through the vercel.json `includeFiles` configuration, and `processEnv.js` hydrates the runtime environment from it. Serverless invocations then make no Secret Manager or STS calls, and the OIDC Workload Identity Federation runtime configuration is not required.

The schema's `@encryptInjectedEnv=forEnv(production)` decorator encrypts production blobs with AES-256-GCM. Generate a key with `pnpm exec varlock generate-key --plain`, keep it in `.env.local` (or the shell environment) for the freeze script, and set the same `_VARLOCK_ENV_KEY` as a sensitive environment variable in the Vercel project so the runtime can decrypt the blob.

Rotating a secret in Google Secret Manager requires a new freeze and deployment, because the resolved values are fixed per deployment.

The blob is only read when the `VERCEL` environment variable is set, so a frozen blob on a development machine cannot leak production values into a local process. Deployments without a blob fall back to runtime resolution through the OIDC Workload Identity Federation flow described above.

Validate the schema and local env files with:

```sh
pnpm exec varlock load --compact
```

If Google Secret Manager returns `invalid_grant` or `invalid_rapt` locally, refresh Application Default Credentials with `gcloud auth application-default login`.

The gcloud CLI must be installed locally.
https://docs.cloud.google.com/sdk/docs/install-sdk
