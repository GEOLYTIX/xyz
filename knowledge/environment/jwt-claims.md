---
type: Environment Variable
title: Session token claims
description: JWT_TYPE, JWT_ISSUER and JWT_AUDIENCE set the typ, iss and aud claims of signed user tokens.
resource: ../../apps/xyz/mod/user/jwtClaims.js
tags: [xyz, environment, security, auth, jwt]
status: draft
x-xyz-variables: [JWT_TYPE, JWT_ISSUER, JWT_AUDIENCE]
sources:
  - resource: ../../apps/xyz/mod/user/jwtClaims.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/mod/user/redirect.js
  - resource: ../../apps/xyz/mod/user/auth.js
  - resource: ../../apps/xyz/mod/user/cookie.js
  - resource: ../../apps/xyz/tests/mod/user/jwtClaims.test.mjs
---
# Session token claims

Every user token XYZ signs, whether at login (redirect), on cookie renewal or in
the auth module, merges the claims returned by `jwtClaims()`:

| Variable | Claim | Default |
|---|---|---|
| `JWT_TYPE` | `typ` | `session` |
| `JWT_ISSUER` | `iss` | `xyz` |
| `JWT_AUDIENCE` | `aud` | `xyz` |

`JWT_AUDIENCE` is split on commas, so `aud` is always an array, eg.
`JWT_AUDIENCE=xyz,other-service` gives `["xyz", "other-service"]`.

The claims let another service authenticate users through XYZ by verifying the
token type, issuer and audience. A service that verifies against fixed names
needs `JWT_ISSUER` and `JWT_AUDIENCE` set to match. The `typ` claim separates a
user session token from an API key token.

The defaults are applied in `processEnv.js` with `??=`, unlike most XYZ defaults
which use `||=`. An empty value, as declared by a varlock schema without a value,
is kept rather than replaced, and gives an empty claim. The
[jwtClaims JSDoc](../../apps/xyz/mod/user/jwtClaims.js) still says the variables
must be configured for the claims to be included; the defaults make that
obsolete.

Changing these values invalidates tokens for any service which verifies the
previous claims.
