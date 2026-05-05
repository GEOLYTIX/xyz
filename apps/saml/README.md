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
        "includeFiles": "{public/**,apps/xyz/*.crt,apps/xyz/*.pem}"
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
