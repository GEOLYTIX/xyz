The saml.js turbo application [module] can be imported into an express app script alongside the xyz express app.

This allows to add additional routes to the xyz express app for saml authentication.

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
app.post(
  `${xyzEnv.DIR}/saml/acs`,
  express.urlencoded({ extended: true }),
  saml,
);

export default app;
```

The saml-server.js script is provided in the xyz repository root and can be deployed to vercel as a build for the node runtime.

Any request must be routed to the saml-server script. The build and routing can be defined in a vercel.json configuration.

```json
{
  "version": 2,
  "trailingSlash": false,
  "builds": [
    {
      "src": "/saml-server.js",
      "use": "@vercel/node",
      "config": {
        "includeFiles": "public/**"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/saml-server.js"
    }
  ]
}
```

The vercel.json in the apps/saml directory can be used as local config for deployments with the vercel cli.

```bash
vercel --force --prod --local-config apps/saml/vercel.json
```
