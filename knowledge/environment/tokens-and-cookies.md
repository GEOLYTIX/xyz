---
type: Environment Variable
title: Tokens and cookies
description: SECRET, SECRET_KEY and SECRET_ALGORITHM sign user tokens; TITLE, COOKIE_TTL and COOKIE_PROPS name and shape the user cookie.
resource: ../../apps/xyz/mod/utils/processEnv.js
tags: [xyz, environment, security, auth, jwt, cookies]
status: draft
x-xyz-variables: [SECRET, SECRET_KEY, SECRET_ALGORITHM, TITLE, COOKIE_TTL, COOKIE_PROPS]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/mod/user/auth.js
  - resource: ../../apps/xyz/mod/user/cookie.js
  - resource: ../../apps/xyz/mod/user/redirect.js
  - resource: ../../apps/xyz/mod/user/key.js
  - resource: ../../apps/xyz/mod/user/login.js
  - resource: ../../apps/xyz/mod/view.js
  - resource: ../../apps/xyz/mod/workspace/cache.js
  - resource: ../../apps/xyz/tests/mod/utils/processEnv.test.mjs
  - resource: ../../apps/xyz/tests/mod/user/auth.test.mjs
  - resource: ../../apps/xyz/tests/mod/user/cookie.test.mjs
---
# Tokens and cookies

| Variable | Default | Purpose |
|---|---|---|
| `SECRET` | none | Secret string which signs user tokens. |
| `SECRET_KEY` | none | PEM private key, inline or as a key file, used instead of `SECRET`. |
| `SECRET_ALGORITHM` | `HS256`, or `RS256` with `SECRET_KEY` | Token signing algorithm. |
| `TITLE` | `GEOLYTIX \| XYZ` | Name of the user cookie and the instance title. |
| `COOKIE_TTL` | `36000` | Lifetime of the user cookie and token, in seconds (10 hours). |
| `COOKIE_PROPS` | see below | Attributes of every cookie XYZ sets. |

## Signing

An instance with an [ACL](access-control.md) needs `SECRET` or `SECRET_KEY`.
Without either, no token verifies and nobody can log in. Session cookies,
cookie renewals and API keys are all signed with the same secret, so changing
it logs out every user and invalidates every API key. The token claims are in
[Session token claims](jwt-claims.md).

`SECRET_KEY` holds a PEM private key, as a secret manager provides it, or the
path of a key file relative to `XYZ_CWD`. A value starting with `-----BEGIN`,
after any leading whitespace, is used as the key itself. A key file which
cannot be read stops the process at startup. The key replaces `SECRET`, and
`SECRET_ALGORITHM` defaults to `RS256` unless it is set.

```dotenv
SECRET_KEY=keys/xyz_private.pem
```

Use an RSA or EC algorithm with a key, and an HMAC algorithm such as `HS256`
with a `SECRET` string.

## The user cookie

The user token is stored in a cookie named after `TITLE`. A login redirect
target is held in a `<TITLE>_redirect` cookie: for 60 seconds when a
`PRIVATE` request is redirected to the login, and for 300 seconds when the
login view is opened with a `return_to` param. `TITLE` is also
the `title` parameter of view templates and the default `workspace.key`.
Instances served from one domain and path need different titles, or their
cookies collide.

`COOKIE_TTL` sets the cookie `Max-Age` and the token expiry at login and on
each renewal through `/api/user/cookie`.

`COOKIE_PROPS` is appended to every cookie set by XYZ and the
[SAML app](saml.md). The default is:

```text
Secure; HttpOnly; SameSite=Strict; Path=<DIR or />
```

The cookie path follows `DIR`. A deployment served over plain HTTP must set
`COOKIE_PROPS` without `Secure`, since browsers do not store secure cookies
from such origins (most allow it on `localhost`):

```dotenv
COOKIE_PROPS=HttpOnly; SameSite=Strict; Path=/
```

Cookies are removed with `null; Max-Age=0` and the same attributes. A browser
only replaces a cookie with the same path, so after a change of `DIR` or of
the `Path` in `COOKIE_PROPS`, existing cookies stay until they expire.

## Empty values

Unlike the other defaults, the `COOKIE_PROPS` default only applies when the
variable is undefined. A varlock schema which declares `COOKIE_PROPS` without
a value injects an empty string, and every cookie is set without attributes.
Leave it out of the schema, or give it a value. An empty `TITLE`,
`COOKIE_TTL` or `SECRET_ALGORITHM` takes the default.
