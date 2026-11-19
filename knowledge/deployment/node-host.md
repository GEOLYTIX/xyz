---
type: Guide
title: Node host
description: Run the XYZ Express app as a long-lived server on your own Node host, and configure cookies and redirects when one XYZ instance handles login for others.
tags: [deployment, node, hosting, login]
status: draft
resource: ../../apps/xyz/server.js
sources:
  - id: deployment
    resource: ../../DEPLOYMENT.md
  - id: server
    resource: ../../apps/xyz/server.js
  - id: process-env
    resource: ../../apps/xyz/mod/utils/processEnv.js
---
# Node host

`server.js` calls `app.listen(xyzEnv.PORT)` whenever `VERCEL` is unset, so the
same entry point runs as a long-lived server.[^server] The repository has no
Dockerfile; containerising it follows the same steps.[^deployment]

A checkout of `main` or a release tag carries the MAPP bundles. On another
branch, build them first with a full `pnpm install`; the Vite build tools are
dev dependencies, which `--prod` does not install. See
[release builds](release-builds.md).

```bash
pnpm install --prod
pnpm exec varlock run -- node apps/xyz/server.js   # with Varlock
node apps/xyz/server.js                            # environment from the host
```

- Under `varlock run`, `.env` and `.env.schema` resolve at process start, so
  `gsm()` references need credentials on the host, and a restart picks up new
  secret versions. See [Vercel environment](vercel-environment.md#google-secret-manager).
- [`PORT`](../environment/server.md) defaults to `3000`. Put a
  TLS-terminating proxy in front; the default cookies are `Secure`.
- Set `XYZ_CWD` when the working directory is not the repository root, so
  `resources`, `*.pem` and `file:` workspace references resolve.
- A normal install builds the native `bcrypt` module, which password login
  needs; `--ignore-scripts` skips it.
- The same smoke routes apply as on [Vercel](vercel.md#check-roll-back-promote).

## One XYZ instance for login

When one instance, eg. an admin instance, handles login for others:

- **`COOKIE_PROPS`.** Instances on subdomains (`admin.example.com`,
  `mapp.example.com`) need `Domain=.example.com`, eg.
  `COOKIE_PROPS="Secure; HttpOnly; SameSite=Strict; Domain=.example.com; Path=/"`.
  Instances on paths of one domain (`example.com/admin`, `example.com/demo`)
  need no change; the default omits `Domain` and derives `Path` from
  `DIR`.[^process-env]
- **`TRUSTED_RETURN_HOSTS`.** Only the subdomain layout needs it, since its
  `return_to` is an absolute URL, eg. `TRUSTED_RETURN_HOSTS=https://admin.example.com`.
  Unset, no absolute `return_to` is accepted. See
  [TRUSTED_RETURN_HOSTS](../environment/trusted-return-hosts.md).
- **`JWT_ISSUER` and `JWT_AUDIENCE`.** The `iss` and `aud` claims of the
  session token, both `xyz` by default. See
  [session token claims](../environment/jwt-claims.md).

[^deployment]: DEPLOYMENT.md, "Your own Node host" and "Using XYZ for login".
[^server]: apps/xyz/server.js.
[^process-env]: apps/xyz/mod/utils/processEnv.js `COOKIE_PROPS` default.
