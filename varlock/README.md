## Environment Configuration
The node process running an XYZ Express app requires environment variables as configuration of the service.

Environment variables are read from an .env file in the root directory.

Varlock protects sensitive environment variables and generates types according to your schema.

To get started you can copy and rename the vanilla env and schema provided in this directory.

```sh
cp varlock/vanilla.env .env
cp varlock/vanilla.env.schema .env.schema
```

The /public/workspace.json file is referenced in the example env.

You are now able to use pnpm to execute the dev script defined in the package.json.

```sh
pnpm dev
```

### varlock load

New variables required to configure the XYZ process must be added to the env and schema. The varlock load command loads and validates variables in your env files and prints the results.

```sh
pnpm exec varlock load --compact
```

### Platform variables

Platform variables like NODE_ENV, VERCEL, and XYZ_CWD should not be kept in the env.schema to prevent these being overriden at runtime.

### Git commits
The `.env`, `.env.*`, `.env.schema`, or `.varlock.blob` files must NOT be committed to your Git repository.

### Google Cloud Secret Manager and Application Default Credentials (ADC)

Sensitive variables can be stored in the Google Cloud Secret Manager. An example env and schema are provided in the directory.

```sh
cp varlock/gsm-adc.env .env
cp varlock/gsm-adc.env.schema .env.schema
```

The example env and schema add the `GCP_PROJECT_ID` variable which must be set to the Google Cloud Project ID.

The `GOOGLE_CREDENTIALS` variable added should be left empty to use Application Default Credentials (ADC). A value is only required to provide a service account JSON directly.

Sensitive variables can be added through the GSM Google Cloud console.

The GSM schema loads a varlock plugin to resolve GSM variables.

The variable values are referenced as `gsm()` like so:

```
# @sensitive=true @type=string
PUBLIC=gsm('PUBLIC')
```

In order to resolve sensitive variables stored in GSM for a local process runtime it is required to login with gcloud auth.

```sh
gcloud auth application-default login
```

## Deployment to Vercel

For deployments to Vercel it is required to freeze the active local schema and env values before deploying:

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
