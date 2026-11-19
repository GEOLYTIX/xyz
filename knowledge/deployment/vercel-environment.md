---
type: Guide
title: Vercel environment
description: Choose how a Vercel deployment gets its environment (vercel.json env, project variables or a frozen Varlock blob), resolve Google Secret Manager references, deploy from CI and troubleshoot missing variables.
tags: [deployment, vercel, varlock, secrets, ci]
status: draft
resource: ../../apps/xyz/mod/utils/processEnv.js
sources:
  - id: deployment
    resource: ../../DEPLOYMENT.md
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/VERCEL
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: process-env
    resource: ../../apps/xyz/mod/utils/processEnv.js
  - id: freeze
    resource: ../../utils/freeze-env.js
  - id: deploy
    resource: ../../utils/deploy-vercel.js
  - id: push
    resource: ../../utils/sync-vercel-env.js
  - id: varlock
    resource: ../../varlock/README.md
---
# Vercel environment

Varlock is optional. `processEnv.js` hydrates from a frozen `.varlock.blob`
when one ships, and otherwise uses the variables the function was started
with.[^process-env] Pick one option per project. The variables themselves
are described in [environment](../environment/index.md).[^deployment]

## Option: vercel.json env

Add the `env` of a [launch configuration](running-locally.md) to
`vercel.json`; the file is committed, so only for values which are not secret:

```json
"env": { "WORKSPACE": "file:./public/workspace.json" }
```

## Option: Vercel project variables

Set the variables in the project settings, then deploy with `vercel --prod` or
`vercel --target=preview`. Nothing is frozen, and Git-integration deploys
work. Schema validation, `gsm()` references and Varlock's log and response
redaction do not run without a blob.

```bash
vercel env add <NAME> production       # one variable
pnpm push-env --dry-run                # list the keys of .env
pnpm push-env --env=production         # upload .env
pnpm push-env --file=.env.preview --env=preview
```

`pnpm push-env` (`utils/sync-vercel-env.js`) upserts each key encrypted and
skips `VERCEL_*` keys. `--env` defaults to `development`. It needs a linked
project and a token from `--token=`, `VERCEL_TOKEN` or a `VERCEL_TOKEN`
entry in `.env.vercel`; keep the token out of `.env`.[^scripts] Vercel applies
variables at build time, so redeploy after a change.

## Option: frozen Varlock blob

```
.env + .env.schema ──pnpm freeze-env──▶ .varlock.blob ──includeFiles──▶ deployment
   (+ gsm() refs)                        (encrypted)          │
                                     processEnv.js decrypts with _VARLOCK_ENV_KEY
```

`pnpm freeze-env --env=<APP_ENV>` validates the whole schema, so a missing
variable or failed `gsm()` lookup fails before the deployment.[^scripts] The
`varlock/` schemas set `@encryptInjectedEnv=forEnv(production)`, so production
blobs are encrypted and the project needs `_VARLOCK_ENV_KEY`. Blob values
override project variables of the same name. `.varlock.blob` is gitignored,
so a Git-integration deploy never carries one.

```bash
pnpm deploy:vercel --env=production                      # rotates the key
pnpm deploy:vercel --env=preview --varlock-env=staging   # APP_ENV differs
```

`pnpm deploy:vercel` builds the bundles, generates a key, freezes the blob
with it, stores the key in the target environment, then deploys; the key must
exist before the blob is frozen.[^scripts] Vercel CLI flags such as `--scope`,
`--token`, `--local-config` and `--force` pass through. To keep the existing
key, set `_VARLOCK_ENV_KEY` locally and in the project, then:

```bash
pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
pnpm freeze-env --env=production
vercel --prod
```

An encrypted blob without `_VARLOCK_ENV_KEY` throws at startup; a missing
blob shows as missing configuration.

## Google Secret Manager

Start from `varlock/gsm-adc.env` and `varlock/gsm-adc.env.schema`, copied to
`.env` and `.env.schema`. The schema loads
`@varlock/google-secret-manager-plugin` with `GCP_PROJECT_ID` and
`GOOGLE_CREDENTIALS`. Reference secrets as `SECRET=gsm("xyz-secret")`, or
`PUBLIC=gsm()` for a secret named after the key.[^varlock]

Leave `GOOGLE_CREDENTIALS` empty to use Application Default Credentials
(`gcloud auth application-default login`); set it to a service account JSON
where there is no interactive login, eg. in CI.

Whoever runs `pnpm freeze-env` resolves `gsm()`, never the deployed function.
The deployment needs no GCP credentials and makes no Secret Manager calls, the
freezing machine needs read access to the secrets, and a rotated secret only
reaches the deployment after the next freeze and deploy. Check resolution with
`pnpm exec varlock load --compact`.

## CI

A deploying workflow builds the bundles, freezes the blob, and deploys:

```yaml
- run: pnpm install --ignore-scripts
- run: pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
- run: pnpm freeze-env --env=production
  env:
    _VARLOCK_ENV_KEY: ${{ secrets.VARLOCK_ENV_KEY }}
    GOOGLE_CREDENTIALS: ${{ secrets.GOOGLE_CREDENTIALS }}
- run: pnpm exec vercel --prod --yes --token=${{ secrets.VERCEL_TOKEN }}
```

Pin the Vercel CLI version and pass `--yes` so the job cannot wait on a
prompt.

## Troubleshooting

- **Defaults used instead of variables:** no blob ships and the project lacks
  the variables, or got them after the build. Check `vercel env ls` and
  redeploy, or check the blob is in the root and in `includeFiles`.
- **`.varlock.blob is encrypted but _VARLOCK_ENV_KEY is not set`:** add the
  key to the Vercel environment and deploy again.
- **Decryption fails:** the project key differs from the freezing key. Run
  `pnpm deploy:vercel --env=<target>` to regenerate both.
- **`gsm()` fails during freeze:** log in with ADC, check `GCP_PROJECT_ID`.
- **Stale frontend:** rebuild with `--force` and deploy again.
- **404 on every route:** check `DIR`; `COOKIE_PROPS` derives its `Path`
  from it.

[^deployment]: DEPLOYMENT.md configuration, deploying, CI and troubleshooting sections.
[^process-env]: apps/xyz/mod/utils/processEnv.js.
[^scripts]: utils/freeze-env.js, utils/deploy-vercel.js and utils/sync-vercel-env.js.
[^varlock]: varlock/README.md and the gsm-adc examples.
