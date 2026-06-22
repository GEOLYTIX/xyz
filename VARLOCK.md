## Environment Configuration

XYZ uses Varlock to validate environment variables before they are loaded by the application. The committed root `.env.schema` is a single flat file which declares every environment key the application understands, with root decorators for the current environment selection, production env encryption, and the Google Secret Manager plugin.

Commit the schema file, but do not commit deployment-specific `.env` files. Local secrets should stay in `.env.local`, which Varlock auto-loads and this repository ignores.

Application packages run from nested directories, so `apps/xyz`, `apps/auth`, `apps/saml`, and `apps/mapp` each declare `varlock.loadPath` in their `package.json` files. This points Varlock back to the repository root, where `.env.schema` and the root env files live.

## How It Works

Local and non-Vercel runtimes resolve the environment when `apps/xyz/mod/utils/processEnv.js` is imported. The loader runs the Varlock CLI in compact JSON mode, stores the serialized environment graph in `process.env.__VARLOCK_ENV`, initializes Varlock, and applies Varlock's console and response patches so sensitive values are redacted from logs and HTTP output.

Vercel runtimes do not resolve `.env` files, load Varlock plugins, or call Google Secret Manager during a request. When `process.env.VERCEL` is set, `processEnv.js` reads the prebuilt `.varlock.blob`, decrypts it if required, assigns it to `process.env.__VARLOCK_ENV`, and initializes Varlock from that frozen graph.

Server defaults are still owned by `processEnv.js`. Varlock injects schema-declared keys without a value as empty strings, so defaults use `||=` after Varlock has loaded. Keep conditional defaults, such as the `SECRET_ALGORITHM=RS256` fallback for `SECRET_KEY`, out of `.env.schema`.

The MAPP build uses `@varlock/vite-integration` in `apps/mapp/vite.config.mjs`. The build reads the same root schema and env files through `varlock.loadPath`, then outputs the `mapp.js` and `ui.js` library bundles to `public/js/lib`.

## Schema Rules

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

## Local Setup

Create a root `.env` file for local development:

```env
PORT=3000
TITLE=GEOLYTIX | XYZ
SECRET=replace-this-with-a-long-random-string
WORKSPACE=file:./public/workspace.json
```

Validate the schema and local env files before starting the app:

```sh
pnpm exec varlock load --compact
```

Start the XYZ server:

```sh
pnpm dev
```

Runtime and test scripts are launched through `varlock run --`. Locally, `processEnv.js` consumes the serialized environment that Varlock injects into `process.env.__VARLOCK_ENV`; on Vercel, it consumes the frozen `.varlock.blob` generated before deployment.

Build the MAPP client bundles:

```sh
pnpm build --filter=@geolytix/mapp
```

For unminified MAPP bundles during browser debugging, run:

```sh
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
```

To select an environment-specific Varlock file for a local command, set `APP_ENV`. For example, `APP_ENV=production` makes Varlock include production env inputs, such as `.env.production`, if present:

```sh
APP_ENV=production pnpm exec varlock load --compact
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

Use `gsm()` values in ignored env files, not in `.env.schema`:

```env
GCP_PROJECT_ID=your-gcp-project-id
SECRET=gsm("xyz-secret")
DBS_NEON=gsm("dbs-neon")
WORKSPACE=gsm("xyz-workspace")
```

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

Deployment checklist:

1. Create or update the ignored environment file for the target, for example `.env.production`.
2. Authenticate the deploying machine so it can resolve `gsm()` references, usually with `gcloud auth application-default login`.
3. Generate an encryption key with `pnpm exec varlock generate-key --plain` if deploying production.
4. Set `_VARLOCK_ENV_KEY` locally for the freeze command and as a sensitive variable in the Vercel project.
5. Run `pnpm freeze-env --env=production` from the repository root.
6. Confirm `.varlock.blob` exists locally and is not staged for git.
7. Run `vercel --prod`.

The schema's `@encryptInjectedEnv=forEnv(production)` decorator encrypts production blobs with AES-256-GCM. Generate a key with `pnpm exec varlock generate-key --plain`, keep it in `.env.local` (or the shell environment) for the freeze script, and set the same `_VARLOCK_ENV_KEY` as a sensitive environment variable in the Vercel project so the runtime can decrypt the blob.

Rotating a secret in Google Secret Manager requires a new freeze and deployment, because the resolved values are fixed per deployment.

The blob is gitignored and only read when the `VERCEL` environment variable is set, so a frozen blob on a development machine cannot leak deployment values into a local process.

The root `vercel.json` deploys `apps/xyz/server.js` and includes `.varlock.blob`, `public/**`, and `resources/**`. The auth and SAML app Vercel configs also include `.varlock.blob`; the SAML config additionally includes certificate files from `apps/xyz`.

The legacy `push-env` script still syncs raw env files to Vercel when needed, but frozen deployments only require runtime variables that are not embedded in the blob. For encrypted production blobs, `_VARLOCK_ENV_KEY` must be present in Vercel.

## Validation

Validate the schema and local env files with:

```sh
pnpm exec varlock load --compact
```

Validate a production freeze without deploying by running:

```sh
pnpm freeze-env --env=production
```

The command should finish with `Frozen production environment written to .varlock.blob (encrypted)` when production encryption is active.

## Troubleshooting

If Vercel throws `Missing .varlock.blob`, run `pnpm freeze-env --env=production` before deployment and confirm the root `vercel.json` includes `.varlock.blob`.

If Vercel throws `.varlock.blob is encrypted but _VARLOCK_ENV_KEY is not set`, add the same `_VARLOCK_ENV_KEY` used during the freeze to the Vercel project environment.

If a `DBS_*` value is ignored or rejected, declare that exact key in `.env.schema`; Varlock does not validate open-ended wildcard keys.

If a rotated Google Secret Manager value is not visible in Vercel, freeze and deploy again. The deployed runtime reads fixed values from `.varlock.blob`.

If a platform-provided value such as `VERCEL`, `NODE_ENV`, or `XYZ_CWD` is unexpectedly overwritten, check that it has not been added to `.env.schema`.
