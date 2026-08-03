# Deployment

This document covers deploying the XYZ monorepo. The primary target is Vercel, where the Express app runs as a Node serverless function. A section at the end covers running the same app on your own Node host.

For local setup see [SETUP.md](./SETUP.md). For environment schema and secret handling see [varlock/README.md](./varlock/README.md).

## How a deployment is put together

The repository root `vercel.json` builds a single entry point and routes every request to it:

```json
{
  "builds": [
    {
      "src": "apps/xyz/server.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": [".varlock.blob", "public/**", "resources/**"]
      }
    }
  ],
  "routes": [{ "src": "/(.*)", "dest": "apps/xyz/server.js" }]
}
```


Three things follow from this:

- **There is no build command.** Vercel does not run `pnpm build`. The MAPP bundles under `public/js/lib` are committed to the repository and shipped as-is. If you changed anything in `apps/mapp`, rebuild and commit before deploying — see [Rebuilding the MAPP bundles](#rebuilding-the-mapp-bundles).
- **`apps/xyz/server.js` does not call `app.listen()` on Vercel.** It checks `process.env.VERCEL` and exports the Express app instead, which `@vercel/node` invokes per request.
- **`.varlock.blob` is optional.** If the blob is present it is used; if not, the app falls back to the environment variables configured in Vercel project settings. See [Environment model](#environment-model).

## Environment model

Varlock is optional. `apps/xyz/mod/utils/processEnv.js` supports two ways of getting configuration into a deployment, and you can pick either per project.

### Option A — Vercel project environment variables

Set the variables in Vercel project settings (dashboard, `vercel env add`, or `pnpm push-env`) and deploy. Nothing needs to be frozen, and `git push` deploys through Vercel's Git integration work normally.

```
Vercel project env  ──build──▶  process.env  ──▶  processEnv.js applies defaults  ──▶  xyzEnv
```

This is the simpler path. It gives up Varlock's schema validation, `gsm()` secret references, and log/response redaction, since none of those run when there is no blob.

### Option B — frozen Varlock blob

Resolve, validate, and freeze the environment into `.varlock.blob` before deploying. `vercel.json` ships the blob via `includeFiles`, and the app hydrates from it at cold start.

```
.env + .env.schema  ──pnpm freeze-env──▶  .varlock.blob  ──includeFiles──▶  deployment
      (+ gsm() refs)                        (encrypted)         │
                                                                ▼
                                              processEnv.js decrypts with _VARLOCK_ENV_KEY
```

The only environment variable the Vercel project itself needs is `_VARLOCK_ENV_KEY`, and only when the blob is encrypted. The schemas in `varlock/` set `@encryptInjectedEnv=forEnv(production)`, so production blobs are encrypted with AES-256-GCM.

Freezing means serverless invocations make no Google Secret Manager or STS calls, at the cost of needing a fresh deployment whenever a secret value changes. It also keeps schema validation and the redaction of sensitive values from logs and HTTP responses.

Values from the blob are injected into `process.env` and take precedence over anything set in Vercel project settings for the same key.

Note that `.varlock.blob` is gitignored, so a Git-integration deploy can never carry one. If you want Option B, deploy from a machine or CI job that freezes first — see [CI deployment](#ci-deployment).

### One case still fails fast

An **encrypted** blob with no `_VARLOCK_ENV_KEY` throws at startup. That combination is a misconfiguration rather than an opt out, so it is not silently ignored:

```
.varlock.blob is encrypted but _VARLOCK_ENV_KEY is not set in the process environment.
```

## Prerequisites

- Node 22+ and pnpm 10+ (`packageManager` pins pnpm 11.1.3).
- Vercel CLI installed globally — it is **not** a repository dependency:
  ```bash
  pnpm add -g vercel
  ```
- A linked Vercel project. From the repository root:
  ```bash
  vercel link
  ```
  This writes `.vercel/project.json` (gitignored) with the `projectId` and `orgId`.
Only when freezing a Varlock blob (Option B):

- A valid `.env` and `.env.schema` in the repository root. Confirm they resolve before deploying:
  ```bash
  pnpm exec varlock load --compact
  ```
- If your `.env` resolves secrets through Google Secret Manager, working Application Default Credentials:
  ```bash
  gcloud auth application-default login
  ```

## Deploying

### Without Varlock

Set the variables the app needs in Vercel project settings, then deploy:

```bash
vercel --prod              # production
vercel --target=preview    # preview
```

`vercel env add <NAME> production` adds a single variable, or `pnpm push-env --env=production` uploads a whole env file — see [Pushing plain environment variables](#pushing-plain-environment-variables). With this setup, Vercel's Git integration works normally and you do not need to deploy from the CLI at all.

Because Vercel resolves environment variables at build time, a variable added after a build does not reach that build. Redeploy after changing one.

### With a frozen blob, one command, with key rotation

```bash
pnpm deploy:vercel --env=production
pnpm deploy:vercel --env=preview
```

`utils/deploy-vercel.js` runs four steps in order:

1. Generates a fresh key with `varlock generate-key --plain`.
2. Runs `utils/freeze-env.js` with that key, writing an encrypted `.varlock.blob`.
3. Stores the key in the target Vercel environment (`vercel env add _VARLOCK_ENV_KEY <environment> --sensitive --force`).
4. Deploys (`vercel --prod` for production, `vercel --target=preview` otherwise).

The ordering matters: Vercel resolves environment variables at build time, so the key has to be in place *before* the deploy starts.

Vercel CLI flags are passed through, for example:

```bash
pnpm deploy:vercel --env=production --scope=my-team
pnpm deploy:vercel --env=preview --token=$VERCEL_TOKEN --force
```

Use `--varlock-env=<name>` if the Varlock environment name (`APP_ENV`) differs from the Vercel target — for example freezing a `staging` Varlock environment into a Vercel preview deployment:

```bash
pnpm deploy:vercel --env=preview --varlock-env=staging
```

### With a frozen blob, reusing the existing key

If you do not want to rotate `_VARLOCK_ENV_KEY` on every deploy, freeze and deploy separately. `_VARLOCK_ENV_KEY` must be set in your local environment (or `.env.local`) and already stored in the Vercel project:

```bash
pnpm freeze-env --env=production
vercel --prod
```

For a preview:

```bash
pnpm freeze-env --env=preview
vercel --target=preview
```

`freeze-env` validates the whole graph before writing — a missing required variable or a failed `gsm()` lookup fails here rather than in production.

### Verifying a deployment

```bash
vercel ls                      # recent deployments
vercel inspect <deployment-url>
vercel logs <deployment-url> --follow
```

Quick smoke checks against the deployment URL:

- `/` — the application view
- `/api/workspace/locale` — the resolved workspace payload
- `/public/js/lib/mapp.js` — the bundled MAPP library

If `DIR` is set, prefix the routes with that base path.

## Deploying the auth or SAML app

`apps/auth` and `apps/saml` are alternative entry points that import the XYZ Express app and mount extra routes. Each ships its own `vercel.json` with paths relative to the **repository root**, so deploy from the root and point the CLI at the config with `--local-config`:

```bash
pnpm freeze-env --env=production
vercel --prod --local-config=apps/saml/vercel.json
```

or, with key rotation:

```bash
pnpm deploy:vercel --env=production --local-config=apps/saml/vercel.json
```

Notes:

- The SAML config additionally includes `apps/xyz/*.crt` and `apps/xyz/*.pem` so the SP certificate pair is available at runtime. Those files are gitignored, so they must be present locally at deploy time.
- The auth config includes only `.varlock.blob` and `public/**` — add `resources/**` if that app serves file resources.
- Deploy each entry point to its **own Vercel project**. They all claim the `/(.*)` route, so they cannot share one project.

## Rebuilding the MAPP bundles

Vercel ships whatever is in `public/js/lib`. After changing `apps/mapp`:

```bash
pnpm build --filter=@geolytix/mapp
git add public/js/lib public/css
git commit -m "build(mapp): rebuild bundles"
```

To stamp the bundle with the current commit SHA — used to identify which framework version a deployed app is running — use the version script, which rewrites `hash:` in `apps/mapp/lib/mapp.mjs` and then runs the full build:

```bash
node utils/version.js
```

For a readable bundle when debugging in the browser:

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
```

Do not deploy an unminified bundle to production.

## Files included in a deployment

`@vercel/node` traces imports from `apps/xyz/server.js`. Anything read from disk at runtime rather than imported has to be listed in `includeFiles`, and anything matched by `.vercelignore` is excluded from the upload.

`.vercelignore` currently excludes `.env*`, all `*.md`, `apps/mapp`, and `apps/xyz/tests`.

Runtime file reads to be aware of when adding `includeFiles` entries:

| Variable | File read | Resolved from |
|---|---|---|
| `SECRET_KEY` | the path you set | `XYZ_CWD` or the workspace root |
| `SIGN_<KEY>` | `<KEY>.pem` | same |
| `KEY_CLOUDFRONT` | matching `*.pem` | same |
| `FILE_RESOURCES` (default `resources`) | resource files | same |
| `WORKSPACE=file:...` | the workspace JSON | same |

The root `vercel.json` covers `public/**` and `resources/**`. If you use `SECRET_KEY`, `SIGN_*`, or `KEY_CLOUDFRONT`, add the relevant `*.pem` files to `includeFiles` — they are gitignored (`**/*.pem`, `*.crt`), so they upload from your working copy, not from Git.

## Rollback and promotion

```bash
vercel rollback                        # back to the previous production deployment
vercel rollback <deployment-url>       # back to a specific deployment
vercel promote <deployment-url>        # promote a validated preview to production
```

`promote` re-points the production alias without rebuilding, so a preview you have already tested becomes production as the same artifact.

One caveat specific to this repo: each deployment carries its own `.varlock.blob`, and the `_VARLOCK_ENV_KEY` it was built with. Rotating the key with `pnpm deploy:vercel` therefore does not invalidate older deployments — but if you ever change `_VARLOCK_ENV_KEY` in project settings *without* freezing and deploying, new deployments will fail to decrypt. After any rollback, confirm the deployment actually serves traffic (`vercel logs <url>`) rather than assuming it booted.

## CI deployment

There is no deployment workflow in `.github/workflows` today. The existing workflows run quality gates only:

| Workflow | Trigger | Purpose |
|---|---|---|
| `biome.yml` | push, PR | `biome ci .` |
| `unit_tests.yml` | push/PR on `main`, `major`, `minor`, `patch` | `pnpm test` |
| `build.yml` | push/PR on the same branches | coverage + SonarQube scan (skipped for fork PRs) |
| `deploy-docs.yml` | push to `main`, manual | builds JSDoc and publishes to GitHub Pages |

If you are not using Varlock, no deploy workflow is needed at all — enable Vercel's Git integration and set the variables in project settings. A CI job is only necessary if you want to control the deploy yourself, in which case it needs `VERCEL_TOKEN` plus `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` as secrets.

To deploy with a frozen blob, the job additionally has to resolve the environment before deploying. That means:

- Credentials for whatever backs your `gsm()` references — a service account JSON in `GOOGLE_CREDENTIALS`, or GCP Workload Identity Federation.
- The freeze step before the deploy step:

```yaml
- run: pnpm install --ignore-scripts
- run: pnpm freeze-env --env=production
  env:
    _VARLOCK_ENV_KEY: ${{ secrets.VARLOCK_ENV_KEY }}
    GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
- run: pnpm exec vercel --prod --yes --token=${{ secrets.VERCEL_TOKEN }}
```

Pin the Vercel CLI version rather than installing `latest`, and pass `--yes` so the job cannot hang on a prompt.

## Pushing plain environment variables

`pnpm push-env` (`utils/sync-vercel-env.js`) is a separate path that uploads the key/value pairs from a local env file straight into Vercel project settings. It is unrelated to the frozen-blob flow and is mainly useful for projects or environments that are not using Varlock.

```bash
pnpm push-env --dry-run                      # list the keys that would be pushed
pnpm push-env --env=production
pnpm push-env --env=preview --file=.env.preview
```

- Requires a linked project (`.vercel/project.json`).
- Requires a token via `--token=`, `VERCEL_TOKEN`, or a `VERCEL_TOKEN` entry in a `.env.vercel` file. Keep the token out of `.env`.
- Keys prefixed `VERCEL_` are skipped; everything else is upserted as an encrypted variable.
- Custom Vercel environment names are resolved automatically.

Values pushed this way reach `processEnv.js` through the normal `process.env`. If a deployment also ships a frozen blob, the blob wins for any key it defines.

## Deploying to your own Node host

`apps/xyz/server.js` calls `app.listen(xyzEnv.PORT)` whenever `process.env.VERCEL` is unset, so the same entry point runs as a long-lived server.

```bash
pnpm install --prod
pnpm exec varlock run -- node apps/xyz/server.js
```

Varlock is optional here too. Without `varlock run` the process uses the environment variables it was launched with:

```bash
node apps/xyz/server.js
```

Differences from the Vercel path:

- No frozen blob. Under `varlock run`, Varlock resolves `.env` and `.env.schema` in the process, so `gsm()` references are resolved at startup and the host needs credentials for them.
- `PORT` (default `3000`) applies; put a TLS-terminating reverse proxy in front.
- Set `XYZ_CWD` if the process working directory is not the repository root, so `resources`, `*.pem`, and `file:` workspace references resolve.
- Rebuild the MAPP bundles as part of your release, or ship the committed ones.

## Pre-deployment checklist

- [ ] `pnpm test` and `pnpm exec biome check .` pass.
- [ ] `apps/mapp` changes are rebuilt and committed.
- [ ] Any `*.pem` / `*.crt` the configuration needs is present locally and covered by `includeFiles`.
- [ ] Deployed to preview and smoke-tested before production.

With a frozen blob, additionally:

- [ ] `pnpm exec varlock load --compact` resolves cleanly for the target environment.
- [ ] `pnpm freeze-env --env=<target>` has run, or you are using `pnpm deploy:vercel`.

## Troubleshooting

**Variables are missing and defaults are being used instead**
The deployment is running without a frozen blob and the variables are not in Vercel project settings — or they were added after the build. Check with `vercel env ls`, then redeploy.

If you meant to ship a blob, confirm `.varlock.blob` exists at the repository root before deploying, that `.vercelignore` does not exclude it, and that the `vercel.json` you deployed with lists it in `includeFiles`. A Git-integration deploy can never carry one, because the blob is gitignored. A missing blob no longer raises an error — the app falls back to `process.env` — so this shows up as missing configuration rather than a failed boot.

**`.varlock.blob is encrypted but _VARLOCK_ENV_KEY is not set in the process environment.`**
Add the key to the Vercel environment you deployed to, then deploy again — an environment variable added after a build does not reach that build. This is the one Varlock case that still fails fast, since an undecryptable blob is a misconfiguration rather than an opt out.

**Decryption fails**
The key in Vercel does not match the key used to freeze the blob. Re-run `pnpm deploy:vercel --env=<target>`, which regenerates both together.

**`The schema enables encryptInjectedEnv ... but no _VARLOCK_ENV_KEY is set`**
Thrown locally by `freeze-env`. Generate one with `pnpm exec varlock generate-key --plain` and export it, or use `pnpm deploy:vercel`.

**`gsm()` resolution fails during freeze**
Run `gcloud auth application-default login`, and check `GCP_PROJECT_ID` and the secret names in `.env`.

**Stale frontend after deploying**
`public/js/lib` was not rebuilt or not committed. Run `pnpm build --filter=@geolytix/mapp` and commit the output.

**404s on every route**
Check `DIR`. Routes are mounted under that base path and `COOKIE_PROPS` derives its `Path` from it.

**`ERR_PNPM_OUTDATED_LOCKFILE` during a remote build**
`pnpm-lock.yaml` is out of sync with the manifests. Run `pnpm install` and commit the lockfile.

## Related documentation

- [SETUP.md](./SETUP.md) — clone, configure, run locally
- [varlock/README.md](./varlock/README.md) — env schema, secret managers, frozen deployments
- [TESTING.md](./TESTING.md) — test structure and commands
- [DEVELOPING.md](./DEVELOPING.md) — development workflow and Biome
- [DOCUMENTATION.md](./DOCUMENTATION.md) — JSDoc and GitHub Pages
