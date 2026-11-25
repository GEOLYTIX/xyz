---
type: Environment Variable
title: User accounts
description: USER_SESSION, FAILED_ATTEMPTS, APPROVAL_EXPIRY, USER_DOMAINS and PASSWORD_REGEXP set the rules for registration, login and sessions of ACL users.
resource: ../../apps/xyz/mod/user/fromACL.js
tags: [xyz, environment, security, auth, acl, users]
status: draft
x-xyz-variables: [USER_SESSION, FAILED_ATTEMPTS, APPROVAL_EXPIRY, USER_DOMAINS, PASSWORD_REGEXP]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/user/fromACL.js
  - resource: ../../apps/xyz/mod/user/register.js
  - resource: ../../apps/xyz/mod/user/auth.js
  - resource: ../../apps/xyz/mod/user/list.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/tests/mod/user/fromACL.test.mjs
  - resource: ../../apps/xyz/tests/mod/user/register.test.mjs
  - resource: ../../apps/xyz/tests/mod/user/auth.test.mjs
---
# User accounts

These variables only apply with an ACL; see
[Access control list](access-control.md). Some of them need extra ACL columns.

| Variable | Default | Purpose |
|---|---|---|
| `USER_SESSION` | off | One active session per user. Needs a `session` column. |
| `FAILED_ATTEMPTS` | `3` | Failed logins after which an account must verify again. |
| `APPROVAL_EXPIRY` | off | Days until a new account's approval expires. Needs an `expires_on` column. |
| `USER_DOMAINS` | any | Comma separated email domains allowed to register. |
| `PASSWORD_REGEXP` | see below | Password rule for registration and password reset. |

## Sessions

With `USER_SESSION` set, each login stores a new random session key in the
ACL and in the user token. Every request with a token from a cookie is checked
against the ACL key, so a login on another device ends the previous session.
Checked keys are kept in process memory to save ACL queries. API key requests
with a `token` parameter are not checked. Any non-empty value enables it,
including `false`.

## Failed logins

Each wrong password increments `failedattempts` in the ACL. When the count
reaches `FAILED_ATTEMPTS`, the account loses its verification, gets a new
verification token, and the user is sent a `locked_account` email to verify
again. Without [mail](mail.md) the email is not sent, and the account stays
unverified until an administrator verifies it.

## Approval expiry

`APPROVAL_EXPIRY` is a number of days. Registration sets `expires_on` to now
plus that many days, and a password reset renews it for an account which has
one. A login after the date removes the approval and is refused. Admin
accounts never expire. The admin user list shows `expires_on` while the
variable is set.

Setting `APPROVAL_EXPIRY` makes login and the user list select `expires_on`,
so the column must exist in the ACL.

## Registration rules

`USER_DOMAINS` restricts which email addresses can register, case
insensitively. A value may be part of a domain: `geolytix` allows both
`geolytix.com` and `geolytix.co.uk`. Existing accounts are not affected.

```dotenv
USER_DOMAINS=example.com,example.org
```

`PASSWORD_REGEXP` is a regular expression source string, without slashes or
flags, which a new password must match. The default requires 12 characters
with an uppercase letter, a lowercase letter and a digit:

```text
(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])^.{12,}$
```

The Wiki and the `processEnv.js` JSDoc give `{10,}` as the default; the
register module uses `{12,}`.[^wiki]

[^wiki]: Wiki Process-Environment page at revision 3fc379b.
