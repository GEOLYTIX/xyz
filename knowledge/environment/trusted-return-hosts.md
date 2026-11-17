---
type: Environment Variable
title: TRUSTED_RETURN_HOSTS
description: Comma-separated origin allowlist for absolute redirect targets after login.
resource: ../../apps/xyz/mod/user/redirect.js
tags: [xyz, environment, security, auth, redirect]
status: draft
variables: [TRUSTED_RETURN_HOSTS]
sources:
  - resource: ../../apps/xyz/mod/user/redirect.js
  - resource: ../../apps/xyz/mod/user/login.js
  - resource: ../../apps/xyz/mod/middleware/validateRequestAuth.js
  - resource: ../../apps/xyz/tests/mod/user/redirect.test.mjs
---
# TRUSTED_RETURN_HOSTS

After a successful login, the redirect module sends the user to the target held
in `user.redirect` (eg. a SAML RelayState) or in the `<TITLE>_redirect` cookie.
The cookie is set by the login view from a `return_to` query parameter, or by the
request authentication middleware from the originally requested path.

- A relative path which starts with a single `/` is always accepted.
- An absolute URL is accepted only when its origin is listed in
  `TRUSTED_RETURN_HOSTS`. Any other target, and any target which fails to
  decode, falls back to `DIR/`.
- If `TRUSTED_RETURN_HOSTS` is unset, every absolute target is rejected.

```dotenv
TRUSTED_RETURN_HOSTS=https://admin.example.com,https://other.example.com
```

The value is split on commas and compared with the
[URL origin](https://developer.mozilla.org/docs/Web/API/URL/origin) of the
target: scheme, host and a non-default port, with no path or trailing slash.
Entries are not trimmed, so do not put spaces after the commas.

Only list origins under your control. An entry allows a login to hand the
signed-in user to that origin, so a broad allowlist turns the login route into
an open redirect. Check the
[redirect implementation](../../apps/xyz/mod/user/redirect.js) and its
[tests](../../apps/xyz/tests/mod/user/redirect.test.mjs) before changing this
behaviour.
