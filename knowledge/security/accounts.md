---
type: Feature
title: User accounts and the ACL
description: How users register, verify, get approved, log in, get locked and expire, stored in the ACL table; use when configuring or changing user access.
resource: ../../apps/xyz/mod/user/fromACL.js
tags: [security, user, acl, login, xyz]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Security
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: register
    resource: ../../apps/xyz/mod/user/register.js
  - id: verify
    resource: ../../apps/xyz/mod/user/verify.js
  - id: fromacl
    resource: ../../apps/xyz/mod/user/fromACL.js
  - id: login
    resource: ../../apps/xyz/mod/user/login.js
  - resource: ../../apps/xyz/mod/user/acl.js
  - resource: ../../apps/xyz/mod/user/update.js
  - resource: ../../apps/xyz/tests/mod/user
---
# User accounts and the ACL

## Behaviour

Without an ACL the instance has no users: every request is anonymous and the
user routes return nothing. `PRIVATE` or `PUBLIC` names the ACL connection
and its `schema.table`; `PRIVATE` also requires a login for every request.
See the [access control variables](../environment/index.md). The queries
below use `acl_schema.acl_table`, replaced with the configured names. Passwords are stored
encrypted and cannot be read back.

- **Register** (`/api/user/register`): an email and a password matching
  `PASSWORD_REGEXP` (default: upper and lower case letters, a digit, at least
  12 characters). `USER_DOMAINS` restricts the email domains. Registering an
  existing email stores the new password as a pending reset.[^register]
- **Verify** (`/api/user/verify?key=…`): the emailed token, valid once, sets
  `verified`, resets failed attempts and applies a pending password. Admins
  are emailed to approve the account.[^verify]
- **Approve**: an admin sets `approved` in the admin view. Login requires
  both `verified` and `approved`.
- **Log in** (`/api/user/login`): checks the password and sets the user
  cookie; see [authentication](authentication.md).[^fromacl]
- **Failed logins**: each wrong password increments `failedattempts` and
  emails the user. Reaching `FAILED_ATTEMPTS` (default 3) removes
  verification and emails a new verification token.
- **Blocked** accounts cannot log in, register or reset their password.
- **Expiry**: with `APPROVAL_EXPIRY` days, an account's approval lapses at
  `expires_on`, set at registration.
- A `null` password restricts an account to SAML or a custom provider.

## Flow

`login.js` → `fromACL.js` (lookup, password check, failed attempts, session)
→ `redirect.js` (cookie, redirect). `register.js` and `verify.js` write the
ACL and send mail templates through the mailer.

## Where to change

- Account rules: `apps/xyz/mod/user/fromACL.js` and `register.js`.
- Mail and page texts: the language templates of `mod/workspace/templates`.
- Admin listing and updates: `list.js`, `update.js`, `admin.js`.

## Tests

`apps/xyz/tests/mod/user/` covers registration, login, verification and the
ACL queries with a mocked ACL.

## Pitfalls

- The ACL table needs a `session` column when `USER_SESSION` is set.
- The Wiki's 30 second registration throttle is not in the code; rate
  limiting is instance wide (`RATE_LIMIT`).
- The `processEnv` JSDoc gives a 10 character password default; the
  register module requires 12.

# ACL table

```sql
CREATE TABLE acl_schema.acl_table (
  "_id" serial not null,
  email text not null,
  password text,
  verified boolean default false,
  approved boolean default false,
  verificationtoken text,
  approvaltoken text,
  failedattempts integer default 0,
  password_reset text,
  api text,
  approved_by text,
  access_log text[] default '{}'::text[],
  blocked boolean default false,
  roles text[] default '{}'::text[],
  admin boolean default false,
  language text default 'en',
  expires_on bigint,
  session text
);
```

[^register]: user/register.js
[^verify]: user/verify.js
[^fromacl]: user/fromACL.js and failedLogin
