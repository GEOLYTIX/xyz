# Varlock Examples

This directory contains two small starting points.

## Vanilla

Use this when values come from normal `.env` files or platform environment variables.

```sh
cp examples/varlock/vanilla.env.schema .env.schema
cp examples/varlock/vanilla.env .env
pnpm exec varlock load --compact
pnpm dev
```

## GSM ADC

Use this when local development or CI should resolve `gsm(...)` values through Google Application Default Credentials.

```sh
cp examples/varlock/gsm-adc.env.schema .env.schema
cp examples/varlock/gsm-adc.env .env
gcloud auth application-default login
pnpm exec varlock load --compact
```

Do not commit `.env`, `.env.*`, `.env.schema`, or `.varlock.blob`.

For Vercel deployments with a freshly generated `_VARLOCK_ENV_KEY`:

```sh
pnpm deploy:vercel --env=production
```
