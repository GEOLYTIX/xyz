# SAML App

The SAML app provides optional SAML routes mounted onto the XYZ app server.

## Development

From the repository root, start the SAML dev server with:

```bash
pnpm dev:saml
```

That runs `apps/saml/server.js`, imports the XYZ app server, and mounts the SAML routes.

## Configuration

Add the required `SAML_*` variables to the repository root `.env` file. The exact identity provider URLs, certificates, and signing requirements depend on the target SAML provider.

A `PRIVATE` instance must set `AUTH_PATH` to redirect unauthenticated requests to the SAML login:

```env
AUTH_PATH=/saml
```

Requests without a user are redirected to `${DIR}${AUTH_PATH}/login`, eg. `/app/saml/login`. The client login and logout links use the same `AUTH_PATH`. Without `AUTH_PATH` the redirect goes to the default `${DIR}/api/user/login`.

### Migrating from `SAML_LOGIN`

`SAML_LOGIN` was removed in v5.0.0 [#2790](https://github.com/GEOLYTIX/xyz/pull/2790) and is ignored. An instance which still sets `SAML_LOGIN=true` without `AUTH_PATH` will redirect users to `/api/user/login` instead of the SAML login.

Replace `SAML_LOGIN=true` with `AUTH_PATH=/saml`.

### Startup checks

The SAML configuration is created when the server starts. The server does not start if:

- `SAML_ACS`, `SAML_ENTITY_ID`, `SAML_IDP_CRT` or `SAML_SSO` is not set.
- No ACL connection is set in `PRIVATE` or `PUBLIC`.
- A certificate or key file cannot be read from `apps/saml`.
- The `${SAML_SP_CRT}.crt` file does not hold exactly one X.509 certificate, or the certificate does not match the private key in `${SAML_SP_CRT}.pem`.

The error names the missing variable or file.

### Replayed assertions

The ID of every assertion accepted at `/saml/acs` is recorded until the assertion expires. An assertion presented again is rejected with a `401`. The IDs are stored in a `saml_cache` table in the ACL schema, so that every serverless instance sees them. Create the table in the ACL database before you deploy:

```sql
CREATE TABLE IF NOT EXISTS acl_schema.saml_cache (
  key text PRIMARY KEY,
  value text NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS saml_cache_expires_at
  ON acl_schema.saml_cache (expires_at);
```

Replace `acl_schema` with the schema of the ACL table in `PRIVATE` or `PUBLIC`. The ACL connection role needs `SELECT`, `INSERT`, `UPDATE` and `DELETE` on the table. Expired rows are removed when a new assertion is recorded.

Without the table every login fails with a `401`, and the log names the missing `saml_cache` table.

The IdP must set a `NotOnOrAfter` on the assertion `Conditions` or on the bearer `SubjectConfirmationData`. An assertion without one would be valid for ever, and is rejected.

`InResponseTo` is not validated, so IdP-initiated logins are still accepted.

### Cookies

The IdP posts the SAML response cross-site to `/saml/acs`. A redirect response from the ACS would keep the following request in that cross-site navigation, and the browser would not send the user cookie with the default `SameSite=Strict` [COOKIE_PROPS](../xyz/mod/utils/processEnv.js). The user would be redirected to the login again, in a loop for as long as the IdP holds a session.

The ACS responds instead with a short HTML document which navigates to the redirect location. The navigation from that document is same-site and the user cookie is sent. `COOKIE_PROPS` does not need to be changed for SAML.

## Routes

Mounted routes include:

- `/saml/login`
- `/saml/logout`
- `/saml/metadata`
- `/saml/acs`

If `DIR` is set, the routes are mounted under that base path.

## Using the Module

The `saml.js` module can be imported into an Express app alongside the XYZ Express app:

```js
import app from '@geolytix/xyz-app/server';
import saml from '@geolytix/xyz-saml-app';
import express from 'express';

app.get(`${xyzEnv.DIR}/saml/metadata`, saml);
app.get(`${xyzEnv.DIR}/saml/logout`, saml);
app.get(`${xyzEnv.DIR}/saml/login`, saml);
app.get(`${xyzEnv.DIR}/saml/logout/callback`, saml);
app.post(
  `${xyzEnv.DIR}/saml/logout/callback`,
  express.urlencoded({ extended: true }),
  saml,
);
app.post(`${xyzEnv.DIR}/saml/acs`, express.urlencoded({ extended: true }), saml);

export default app;
```

## Vercel

The `apps/saml/server.js` script composes the XYZ Express app with the SAML module and can be deployed to Vercel as a Node runtime build.

Any request must be routed to the SAML server script. The build and routing can be defined in a `vercel.json` configuration:

```json
{
  "version": 2,
  "trailingSlash": false,
  "builds": [
    {
      "src": "apps/saml/server.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": "{public/**,apps/saml/*.crt,apps/saml/*.pem,apps/xyz/*.pem}"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "apps/saml/server.js"
    }
  ]
}
```

The `vercel.json` in the `apps/saml` directory can be used as local config for deployments with the Vercel CLI:

```bash
vercel --force --prod --local-config apps/saml/vercel.json
```

## Related Docs

- Root setup: [../../SETUP.md](../../SETUP.md)
- XYZ app: [../xyz/README.md](../xyz/README.md)
