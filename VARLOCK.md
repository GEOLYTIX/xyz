## Environment Configuration

XYZ uses Varlock to validate environment variables before they are loaded by the application. The committed root `.env.schema` is a single flat file which declares every environment key the application understands, with root decorators for the current environment selection, production env encryption, and the Google Secret Manager plugin.

Commit the schema file, but do not commit deployment-specific `.env` files. Local secrets should stay in `.env.local`, which Varlock auto-loads and this repository ignores.

Schema entries are declarations, not defaults. Varlock injects declared keys without a value as empty strings, so server defaults must remain in `apps/xyz/mod/utils/processEnv.js`, where `||=` fallbacks apply after Varlock has loaded the environment. Do not add default values to `.env.schema` for keys which processEnv.js defaults conditionally, eg. `SECRET_ALGORITHM`.

Platform variables such as `NODE_ENV`, `VERCEL`, or `XYZ_CWD` are intentionally not declared in the schema. Declared keys are injected from the frozen deployment blob and would override the values provided by the platform at runtime.

Database connection variables use the `DBS_` prefix. Varlock schemas validate named variables rather than an open-ended `DBS_*` wildcard, so declare each concrete `DBS_` key a deployment uses at the end of `.env.schema`:

```env
# @type=string
DBS_CLIENT=

# @type=string
DBS_REPORTING=
```

The actual values belong in `.env`, `.env.local`, or environment-specific files such as `.env.production`:

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

## Google Secret Manager

Varlock resolves `gsm()` references with Google Application Default Credentials. Authenticate with `gcloud`, then set `GCP_PROJECT_ID` in your local `.env.local` file:

```sh
gcloud auth application-default login
```

```env
GCP_PROJECT_ID=your-gcp-project-id
```

The authenticated identity must have the `roles/secretmanager.secretAccessor` role for the referenced secrets.

If Google Secret Manager returns `invalid_grant` or `invalid_rapt`, refresh the Application Default Credentials with `gcloud auth application-default login`.

The gcloud CLI must be installed locally.
https://docs.cloud.google.com/sdk/docs/install-sdk

## Frozen environment deployments

Vercel deployments require a frozen environment. The freeze script resolves `gsm()` references with the deploying machine's credentials and validates the configuration against the schema — an invalid configuration fails before the deployment instead of on a serverless invocation:

```sh
pnpm freeze-env --env=production
vercel --prod
```

The resolved values are written to `.varlock.blob`, which ships with the function through the vercel.json `includeFiles` configuration. At runtime `processEnv.js` hydrates the environment from the blob — serverless invocations make no Secret Manager calls and load no plugins.

The `--env` flag selects the Varlock environment, so a production freeze resolves values from the untracked `.env.production` file in the deploying checkout.

The schema's `@encryptInjectedEnv=forEnv(production)` decorator encrypts production blobs with AES-256-GCM. Generate a key with `pnpm exec varlock generate-key --plain`, keep it in `.env.local` (or the shell environment) for the freeze script, and set the same `_VARLOCK_ENV_KEY` as a sensitive environment variable in the Vercel project so the runtime can decrypt the blob.

Rotating a secret in Google Secret Manager requires a new freeze and deployment, because the resolved values are fixed per deployment.

The blob is gitignored and only read when the `VERCEL` environment variable is set, so a frozen blob on a development machine cannot leak deployment values into a local process.

## Validation

Validate the schema and local env files with:

```sh
pnpm exec varlock load --compact
```
