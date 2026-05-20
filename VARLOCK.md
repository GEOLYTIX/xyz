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

For local development, Varlock resolves Google Secret Manager values with Google Application Default Credentials. Authenticate with `gcloud`, then set `GCP_PROJECT_ID` in your local `.env` file:

```sh
gcloud auth application-default login
```

```env
GCP_PROJECT_ID=your-gcp-project-id
```

For deployed environments where Application Default Credentials are not available, provide service-account JSON in `GCP_SA_KEY`. `GCP_SA_KEY` must be JSON content, not a file path. Do not set `GCP_SA_KEY=gsm(...)` because the Google plugin needs credentials before it can fetch secrets.

Validate the full schema with:

```sh
pnpm exec varlock load --path .env.schema --compact
```

Validate a single schema section with:

```sh
pnpm exec varlock load --path .env.schema.d/.env.saml --compact
```

If Google Secret Manager returns `invalid_grant` or `invalid_rapt` locally, refresh Application Default Credentials with `gcloud auth application-default login`.

The gloud cli must be installed locally.
https://docs.cloud.google.com/sdk/docs/install-sdk
