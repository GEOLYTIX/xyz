## Environment Configuration

XYZ supports Varlock, but the repository does not commit a root `.env.schema`. Copy one of the examples from `examples/varlock` to create your local schema.

## Vanilla Setup

Use this when values come from normal `.env` files or platform environment variables:

```sh
cp examples/varlock/vanilla.env.schema .env.schema
cp examples/varlock/vanilla.env .env
pnpm exec varlock load --compact
pnpm dev
```

The vanilla example declares only:

- `APP_ENV`
- `TITLE`
- `WORKSPACE`
- `SECRET`

Add more keys to your copied `.env.schema` only when your deployment needs them, for example `DIR`, `PRIVATE`, `PUBLIC`, or concrete database keys such as `DBS_NEON`.

## GSM ADC Setup

Use this when `gsm(...)` values should resolve through Google Application Default Credentials:

```sh
cp examples/varlock/gsm-adc.env.schema .env.schema
cp examples/varlock/gsm-adc.env .env
gcloud auth application-default login
pnpm exec varlock load --compact
```

The GSM ADC example adds only:

- `GCP_PROJECT_ID`
- `GOOGLE_CREDENTIALS`

Leave `GOOGLE_CREDENTIALS` empty to use ADC. Set it only when you want to provide service account JSON directly.

## Deployment

For Vercel, freeze the active local schema and env values before deploying:

```sh
pnpm freeze-env --env=production
vercel --prod
```

To rotate `_VARLOCK_ENV_KEY`, freeze, upload the key to Vercel, and deploy in one command:

```sh
pnpm deploy:vercel --env=production
pnpm deploy:vercel --env=preview
```

The helper generates a fresh key with `varlock generate-key --plain`, encrypts `.varlock.blob` with that key, stores the same key in the selected Vercel environment, then deploys. It supports Vercel CLI flags such as `--scope=...`, `--token=...`, and `--local-config=...`.

The generated `.varlock.blob` is included by `vercel.json`, so the serverless runtime does not need `.env.schema` or `.env` files.

Do not commit `.env`, `.env.*`, `.env.schema`, or `.varlock.blob`.

## Notes

Do not declare platform variables such as `NODE_ENV`, `VERCEL`, or `XYZ_CWD`; they should keep coming from the runtime platform.

If a `DBS_*` value is ignored, declare that exact key in your copied `.env.schema`. Varlock does not validate wildcard names like `DBS_*`.
