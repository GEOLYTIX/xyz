## Environment Configuration

XYZ uses Varlock to validate environment variables before they are loaded by the application. The root `.env.schema` imports smaller schema files from `.env.schema.d/` so deployments can choose only the configuration sections they need.

Commit schema files, but do not commit deployment-specific `.env` files. Local secrets should stay in `.env.local`, which Varlock auto-loads and this repository ignores.

The default project schema imports every section:

```env
# .env.schema
# @defaultRequired=false @defaultSensitive=false
# @import(./.env.schema.d/.env.runtime)
# @import(./.env.schema.d/.env.auth)
# @import(./.env.schema.d/.env.data)
# @import(./.env.schema.d/.env.integrations)
# @import(./.env.schema.d/.env.workspace)
# @import(./.env.schema.d/.env.saml)
# @import(./.env.schema.d/.env.gsm)
# ---
```

A deployment can use a smaller schema by importing only the required parts. For example, a deployment that needs runtime settings, JWT auth, database secrets, and SAML can use:

```env
# .env.schema
# @defaultRequired=false @defaultSensitive=false
# @import(./.env.schema.d/.env.runtime)
# @import(./.env.schema.d/.env.auth)
# @import(./.env.schema.d/.env.data)
# @import(./.env.schema.d/.env.saml)
# ---
```

Database connection variables use the `DBS_` prefix. Varlock schemas should define each concrete environment key that a deployment uses, because the schema validates named variables rather than an open-ended `DBS_*` wildcard. Define application-specific keys in the schema used by that deployment:

```env
# .env.schema
# @defaultRequired=false @defaultSensitive=false
# @import(./.env.schema.d/.env.runtime)
# @import(./.env.schema.d/.env.auth)
# @import(./.env.schema.d/.env.data)
# ---

# @sensitive @type=string
DBS_CLIENT=

# @sensitive @type=string
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

For Vercel deployments, use OIDC Workload Identity Federation instead of a service-account JSON key. This avoids storing `GCP_SA_KEY` in Vercel.

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

Vercel Functions expose the OIDC token on the `x-vercel-oidc-token` request header, not as a runtime environment variable. The `api/index.js` handler converts that header into a temporary Google external-account credentials file and sets `GOOGLE_APPLICATION_CREDENTIALS` before the API imports Varlock. Varlock then uses the standard ADC path to resolve `gsm()` values.

Keep `GCP_WORKLOAD_IDENTITY_PROVIDER` and `GCP_SERVICE_ACCOUNT_EMAIL` empty locally so Varlock uses Application Default Credentials.

Validate the full schema with:

```sh
pnpm exec varlock load --path .env.schema --compact
```

Validate a single schema section with:

```sh
pnpm exec varlock load --path .env.schema.d/.env.saml --compact
```

Validate only the Google Secret Manager bootstrap configuration with:

```sh
pnpm exec varlock load --path .env.schema.d/.env.gsm --compact
```

If Google Secret Manager returns `invalid_grant` or `invalid_rapt` locally, refresh Application Default Credentials with `gcloud auth application-default login`.

The gcloud CLI must be installed locally.
https://docs.cloud.google.com/sdk/docs/install-sdk
