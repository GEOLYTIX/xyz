# Deployment

Deploying the XYZ monorepo. The primary target is Vercel, where the Express app runs as a Node serverless function; the last section covers running it on your own Node host.

See [SETUP.md](./SETUP.md) for local setup and [varlock/README.md](./varlock/README.md) for env schema detail.

The Vercel CLI must be installed in order to deploy to Vercel from the command line terminal.

```bash
npm install vercel -g
```

## How it is wired

The root `vercel.json` builds one entry point and routes everything to it:

```json
{
  "builds": [{
    "src": "apps/xyz/server.js",
    "use": "@vercel/node",
    "config": { "includeFiles": [".varlock.blob", "public/**", "resources/**"] }
  }],
  "routes": [{ "src": "/(.*)", "dest": "apps/xyz/server.js" }]
}
```

- **No build command runs on Vercel.** The MAPP bundles in `public/js/lib` are committed and shipped as-is. Rebuild and commit after changing `apps/mapp`.
- **`server.js` skips `app.listen()`** when `process.env.VERCEL` is set, exporting the Express app for `@vercel/node` instead.

## Configuration

Varlock is optional. `apps/xyz/mod/utils/processEnv.js` accepts configuration two ways — pick either per project.

### Option: vercel.json env object
The env object from the launch.json can be appended to the vercel.json to deploy an instance with the same environment variables.

```json
"env": {
  "WORKSPACE": "file:./public/workspace.json"
}
```

### Option: Vercel project environment variables

If you have .env file in the project root it is possible to upload these with a vercel api token.

Set the variables in Vercel project settings and deploy. Nothing is frozen, and Git-integration deploys work normally.

```
Vercel project env ──build──▶ process.env ──▶ processEnv.js defaults ──▶ xyzEnv
```

Simplest path. You give up schema validation, `gsm()` references, and log/response redaction, since none of that runs without a blob.

Set the variables in Vercel project settings, then:

```bash
vercel --prod              # production
vercel --target=preview    # preview
```

Use `vercel env add <NAME> production` for one variable or `pnpm push-env --env=production` for a whole file. With this setup Git-integration deploys work and you need not deploy from the CLI at all.

Vercel resolves environment variables at build time, so redeploy after changing one.

### Option: frozen Varlock blob

Resolve and validate the environment into `.varlock.blob` before deploying. `vercel.json` ships it via `includeFiles`, and the app hydrates from it at cold start.

```
.env + .env.schema ──pnpm freeze-env──▶ .varlock.blob ──includeFiles──▶ deployment
      (+ gsm() refs)                      (encrypted)        │
                                                             ▼
                                       processEnv.js decrypts with _VARLOCK_ENV_KEY
```

The project needs only `_VARLOCK_ENV_KEY`, and only when the blob is encrypted — the `varlock/` schemas set `@encryptInjectedEnv=forEnv(production)`, so production blobs are AES-256-GCM encrypted.

Blob values are injected into `process.env` and win over Vercel project settings for the same key. `.varlock.blob` is gitignored, so a Git-integration deploy can never carry one — freeze from a machine or CI job instead.

**One case fails fast:** an encrypted blob with no `_VARLOCK_ENV_KEY` throws at startup. That is a misconfiguration, not an opt out.

### Google Secret Manager

`gsm()` resolves a value from Google Secret Manager. Start from the example pair:

```bash
cp varlock/gsm-adc.env .env
cp varlock/gsm-adc.env.schema .env.schema
```

The schema header loads the plugin and points it at a project:

```
# @plugin(@varlock/google-secret-manager-plugin)
# @initGsm(projectId=$GCP_PROJECT_ID, credentials=$GOOGLE_CREDENTIALS)
```

Reference secrets in the env:

```env
SECRET=gsm("xyz-secret")   # named secret
PUBLIC=gsm()               # secret named after the key
```

**Authentication** comes from `GOOGLE_CREDENTIALS`. Leave it empty to use Application Default Credentials, which is the normal local setup:

```bash
gcloud auth application-default login
```

Set it to a service account JSON when there is no interactive login, such as in CI.

**When resolution happens matters.** For a Vercel deployment, `gsm()` is resolved by whoever runs `pnpm freeze-env` — never by the deployed function. The resolved values are baked into the blob, so:

- the deployment needs no GCP credentials and makes no Secret Manager calls at cold start,
- the machine or CI job that freezes needs read access to the secrets,
- rotating a secret in GSM does not reach the deployment until you freeze and deploy again.

On your own Node host under `varlock run`, resolution happens at process start instead: the host needs credentials, and a restart picks up new secret versions.

Check that everything resolves without deploying:

```bash
pnpm exec varlock load --compact
```

## Prerequisites

- Node 22+ and pnpm 11 (`packageManager` pins pnpm 11.3.0).
- Vercel CLI installed globally — it is **not** a repository dependency: `pnpm add -g vercel`
- A linked project: `vercel link` writes `.vercel/project.json` (gitignored).

Only when freezing a blob: a valid `.env` and `.env.schema` at the repository root, plus credentials for any `gsm()` references.

## Deploying

### With a frozen blob

One command, rotating the key each time:

```bash
pnpm deploy:vercel --env=production
pnpm deploy:vercel --env=preview
```

`utils/deploy-vercel.js` generates a key, freezes the blob with it, stores it in the target Vercel environment, then deploys. The order matters — the key must exist before the build starts.

Vercel CLI flags pass through (`--scope`, `--token`, `--local-config`, `--force`). Use `--varlock-env=<name>` when the Varlock environment (`APP_ENV`) differs from the Vercel target:

```bash
pnpm deploy:vercel --env=preview --varlock-env=staging
```

To keep the existing key instead, freeze and deploy separately with `_VARLOCK_ENV_KEY` already set locally and in the project:

```bash
pnpm freeze-env --env=production
vercel --prod
```

`freeze-env` validates the whole graph first, so a missing variable or failed `gsm()` lookup fails here rather than in production.

### Checking a deployment

```bash
vercel ls
vercel inspect <deployment-url>
vercel logs <deployment-url> --follow
```

Smoke routes: `/`, `/api/workspace/locale`, `/public/js/lib/mapp.js`. Prefix them with `DIR` if it is set.

### The auth and SAML apps

`apps/auth` and `apps/saml` import the XYZ app and mount extra routes. Each has its own `vercel.json` with paths relative to the **repository root**, so deploy from the root with `--local-config`:

```bash
vercel --prod --local-config=apps/saml/vercel.json
```

Deploy each to its **own Vercel project** — they all claim `/(.*)`. The SAML config also ships `apps/xyz/*.crt` and `apps/xyz/*.pem`, which are gitignored and so must be present locally at deploy time.

## Build artefacts

### MAPP bundles

Vercel ships whatever is in `public/js/lib`, so rebuild and commit after changing `apps/mapp`:

```bash
pnpm build --filter=@geolytix/mapp
```

`node utils/version.js` stamps the bundle with the current commit SHA and then builds — useful for identifying which framework version a deployment runs. `NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp` produces an unminified bundle for debugging; do not deploy one.

### Pre-cached workspace

`pnpm workspace:cache` resolves the workspace and inlines every `src` response into a single self-contained JSON, so a deployment does not fetch remote templates on a cold start:

```bash
pnpm workspace:cache                    # writes workspace.generated.json
node ./utils/cache-workspace.js --help  # from apps/xyz, for the options
```

Point `WORKSPACE` at the generated file and make sure it ships. Module templates keep their `src` and are still read at runtime, since their render functions cannot be serialised.

## What ships

`@vercel/node` traces imports from `apps/xyz/server.js`. Anything read from disk at runtime rather than imported must be in `includeFiles`; anything matched by `.vercelignore` (currently `.env*`, `*.md`, `apps/mapp`, `apps/xyz/tests`) is excluded.

Runtime file reads, all resolved from `XYZ_CWD` or the workspace root:

| Variable | File read |
|---|---|
| `SECRET_KEY` | the path you set |
| `SIGN_<KEY>` | `<KEY>.pem` |
| `KEY_CLOUDFRONT` | matching `*.pem` |
| `FILE_RESOURCES` (default `resources`) | resource files |
| `WORKSPACE=file:...` | the workspace JSON |

The root `vercel.json` covers `public/**` and `resources/**`. Using `SECRET_KEY`, `SIGN_*`, or `KEY_CLOUDFRONT` means adding those `*.pem` files to `includeFiles` — they are gitignored, so they upload from your working copy rather than from Git.

## Rollback and promotion

```bash
vercel rollback                    # previous production deployment
vercel promote <deployment-url>    # promote a validated preview
```

`promote` re-points the production alias without rebuilding. Each deployment carries its own blob and the key it was built with, so rotating keys does not invalidate older deployments. Confirm a rollback actually serves traffic (`vercel logs <url>`) rather than assuming it booted.

## CI

No workflow deploys the app. The existing ones are:

| Workflow | Trigger | Purpose |
|---|---|---|
| `biome.yml` | push, PR | `biome ci .` |
| `unit_tests.yml` | push/PR on `main`, `major`, `minor`, `patch` | `pnpm test` |
| `build.yml` | push/PR on the same branches | coverage + SonarQube (skipped for fork PRs) |
| `deploy-docs.yml` | push to `main`, manual | JSDoc to GitHub Pages |
| `release.yml` | `v*` tag | GitHub release from `release-notes/<tag>.md` |

Without Varlock no deploy workflow is needed — use Git integration. To deploy with a frozen blob, freeze before deploying and give the job credentials for any `gsm()` references:

```yaml
- run: pnpm install --ignore-scripts
- run: pnpm freeze-env --env=production
  env:
    _VARLOCK_ENV_KEY: ${{ secrets.VARLOCK_ENV_KEY }}
    GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
- run: pnpm exec vercel --prod --yes --token=${{ secrets.VERCEL_TOKEN }}
```

Pin the Vercel CLI version and pass `--yes` so the job cannot hang on a prompt. Note the existing workflows install with `--ignore-scripts`, which skips the native build for `bcrypt` — fine for tests, but a host that actually signs passwords needs a normal install.

## Pushing plain environment variables

`pnpm push-env` (`utils/sync-vercel-env.js`) uploads a local env file straight into Vercel project settings. It is independent of the frozen-blob flow and mainly for setups not using Varlock.

```bash
pnpm push-env --dry-run              # list keys that would be pushed
pnpm push-env --env=production
pnpm push-env --file=.env.preview --env=preview
```

Requires a linked project and a token via `--token=`, `VERCEL_TOKEN`, or a `VERCEL_TOKEN` entry in `.env.vercel` — keep the token out of `.env`. `VERCEL_*` keys are skipped; the rest are upserted encrypted. If a deployment also ships a blob, the blob wins.

## Your own Node host

`server.js` calls `app.listen(xyzEnv.PORT)` whenever `VERCEL` is unset, so the same entry point runs as a long-lived server:

```bash
pnpm install --prod
pnpm exec varlock run -- node apps/xyz/server.js   # with varlock
node apps/xyz/server.js                            # without
```

- Under `varlock run`, `.env` and `.env.schema` resolve in-process, so `gsm()` references need credentials on the host.
- `PORT` (default `3000`) applies; put a TLS-terminating proxy in front.
- Set `XYZ_CWD` if the working directory is not the repository root, so `resources`, `*.pem`, and `file:` workspace references resolve.

## Troubleshooting

**Variables missing, defaults used instead**
Running without a blob and the variables are not in project settings, or they were added after the build. Check `vercel env ls` and redeploy. If you meant to ship a blob, confirm it exists at the repository root and is in `includeFiles`. A missing blob no longer errors — it shows up as missing configuration, not a failed boot.

**`.varlock.blob is encrypted but _VARLOCK_ENV_KEY is not set`**
Add the key to the Vercel environment and deploy again; a variable added after a build does not reach that build.

**Decryption fails**
The key in Vercel does not match the one used to freeze. Re-run `pnpm deploy:vercel --env=<target>`, which regenerates both together.

**`gsm()` resolution fails during freeze**
Run `gcloud auth application-default login`, and check `GCP_PROJECT_ID` and the secret names in `.env`.

**Stale frontend**
`public/js/lib` was not rebuilt or not committed.

**404s on every route**
Check `DIR` — routes mount under it and `COOKIE_PROPS` derives its `Path` from it.

## Related

- [SETUP.md](./SETUP.md) — clone, configure, run locally
- [varlock/README.md](./varlock/README.md) — env schema and secret managers
- [TESTING.md](./TESTING.md) — test structure and commands
- [DEVELOPING.md](./DEVELOPING.md) — development workflow and Biome
- [DOCUMENTATION.md](./DOCUMENTATION.md) — JSDoc and GitHub Pages
