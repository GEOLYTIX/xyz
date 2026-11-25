---
type: Environment Variable
title: CORS_ORIGINS
description: CORS_ORIGINS lists the origins which may read XYZ API responses and public files from another site.
resource: ../../apps/xyz/mod/middleware/cors.js
tags: [xyz, environment, security, cors]
status: draft
x-xyz-variables: [CORS_ORIGINS]
sources:
  - resource: ../../apps/xyz/mod/middleware/cors.js
  - resource: ../../apps/xyz/router.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/tests/mod/middleware/cors.test.mjs
---
# CORS_ORIGINS

`CORS_ORIGINS` is a comma separated list of origins, or `*` for any origin.
Without it no CORS headers are set, and browsers block cross-origin reads of
XYZ responses.

```dotenv
CORS_ORIGINS=https://codepen.io,https://cdpn.io
```

An origin is the scheme, host and port, without a path or trailing slash,
and must match the request `Origin` header exactly. Spaces around entries are
ignored.

The middleware runs before the rate limit and the static files, so it covers
the API, the views and the `public` files such as the MAPP library bundle.
While `CORS_ORIGINS` is set, every response varies on `Origin`. A preflight
request from a listed origin is answered with `204`, allowing `GET`, `POST`
and `OPTIONS` and caching the answer for 10 minutes.

## Credentials

Credentials are never allowed, so the browser does not send the user cookie
with a cross-origin request. Such a request is anonymous unless it provides
a token itself, as an `Authorization` header or a `token` parameter, and is
then served with that token's rights. CORS is therefore most useful for
`PUBLIC` instances and public files; a page on another site cannot use the
session of a user logged in to XYZ.
