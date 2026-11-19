---
type: Feature
title: Authentication
description: How the XYZ API identifies a user from a cookie, token, API key or authorization header, and how login providers (built-in, SAML, custom) set the cookie; use when changing login or adding a provider.
resource: ../../apps/xyz/mod/user/auth.js
tags: [security, authentication, cookie, token, saml, xyz]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Security
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: custom
    resource: https://github.com/GEOLYTIX/xyz/wiki/Custom-Authentication
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: auth
    resource: ../../apps/xyz/mod/user/auth.js
  - id: redirect
    resource: ../../apps/xyz/mod/user/redirect.js
  - id: middleware
    resource: ../../apps/xyz/mod/middleware/validateRequestAuth.js
  - id: authapp
    resource: ../../apps/auth/server.js
  - resource: ../../apps/auth/customAuth.js
  - resource: ../../apps/auth/providerRequestSignature.js
  - resource: ../../apps/saml/server.js
  - resource: ../../apps/xyz/mod/user/token.js
  - resource: ../../apps/xyz/mod/user/key.js
  - resource: ../../apps/xyz/tests/mod/user/auth.test.mjs
  - resource: ../../apps/xyz/tests/mod/user/redirect.test.mjs
---
# Authentication

## Behaviour

Every request passes `validateRequestAuth`, which calls `auth` to find the
user.[^middleware] A request without a user is anonymous; on a `PRIVATE`
instance it is redirected to the login, `${DIR}${AUTH_PATH}/login`
(default `/api/user/login`).

`auth` takes the first of:[^auth]

1. An `Authorization` header: email and password checked against the ACL.
2. A `token` request param, else the cookie named after `TITLE`. The JWT is
   verified with `SECRET`. A token with an `api` claim is an API key and is
   checked against the key stored in the ACL on every request.
3. With `USER_SESSION`, the token's session must match the ACL, so a new
   login ends earlier sessions. Without it a cookie stays valid until it
   expires.

The user's roles are expanded: `europe.france` adds `europe`, and every
authenticated user has `*`. Users from a token or API key never have admin
rights. `/api/user/token` issues a token, 8 hours by default; `/api/user/key` an API key
for accounts with the `api` field set.

## Login providers

All providers hand a user to `mod/user/redirect.js`, which looks the email up
in the ACL for its roles, signs the JWT cookie and redirects.[^redirect]

- **Built-in**: `/api/user/login`; see [user accounts](accounts.md).
- **SAML**: `apps/saml` mounts `/saml/login`, `/saml/acs`, `/saml/logout`,
  `/saml/logout/callback` and `/saml/metadata`; see the SAML variables in
  [environment](../environment/index.md). The SAML email must have an ACL
  record; SAML users are never admins.
- **Custom**: `apps/auth` is a template provider with `/custom/login`,
  `/custom/verify` and `/custom/logout` routes; `AUTH_PATH` points the login
  links and the `PRIVATE` redirect at it.[^authapp]

Cookies use `COOKIE_PROPS`, by default `Secure; HttpOnly; SameSite=Strict`,
and live `COOKIE_TTL` seconds. A provider setting or revoking a cookie must
use the same properties.

## Flow

`validateRequestAuth` → `user/auth.js` → `fromACL.js` (header) or
`jsonwebtoken` (token, cookie) → `checkParamToken`, `checkSession`.
Login: provider → `user/redirect.js` → `Set-Cookie` and 302.

## Where to change

- Token and session checks: `apps/xyz/mod/user/auth.js`.
- Cookie signing and claims: `redirect.js`, `cookie.js`, `jwtClaims.js`.
- A new provider: copy `apps/auth`, call `redirect` with
  `{ email, lookup: true }`.

## Tests

`apps/xyz/tests/mod/user/` covers auth, cookies, tokens, keys and redirects.

## Pitfalls

- `apps/auth/providerRequestSignature.js` verifies signed provider URLs but
  is not mounted by the default server; mount it where signed URLs are used.
- A deployment over plain HTTP must set `COOKIE_PROPS` without `Secure`.

[^middleware]: middleware/validateRequestAuth.js
[^auth]: user/auth.js
[^redirect]: user/redirect.js
[^authapp]: apps/auth/server.js
