---
type: Environment Variable
title: Mail
description: TRANSPORT_EMAIL and TRANSPORT_PASSWORD let XYZ send account emails through Resend; TRANSPORT_PORT and TRANSPORT_TLS are no longer used.
resource: ../../apps/xyz/mod/utils/resend.js
tags: [xyz, environment, mail, users]
status: draft
x-xyz-variables: [TRANSPORT_EMAIL, TRANSPORT_PASSWORD, TRANSPORT_PORT, TRANSPORT_TLS]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/utils/resend.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/package.json
  - resource: ../../apps/xyz/tests/mod/utils/resend.test.mjs
---
# Mail

| Variable | Default | Purpose |
|---|---|---|
| `TRANSPORT_EMAIL` | none | Sender address of every email. |
| `TRANSPORT_PASSWORD` | none | [Resend](https://resend.com) API key. |
| `TRANSPORT_PORT` | `587` | Not used. |
| `TRANSPORT_TLS` | `false` | Not used. |

XYZ sends account emails: registration and password reset verification,
approval requests to administrators, and approval, deletion and locked
account notices; see [failed logins](user-accounts.md). Mail is sent through the
Resend API. The sender domain must be verified with Resend.

Both `TRANSPORT_EMAIL` and `TRANSPORT_PASSWORD` must be set, and the optional
`resend` dependency installed, or no email is sent. A missing dependency is
logged once at startup. Unsent mail is otherwise silent, so users can
register but never receive the verification link.

```dotenv
TRANSPORT_EMAIL=maps@example.com
TRANSPORT_PASSWORD=re_xxxxxxxx
```

The API key is a secret; keep it in a secret manager or the varlock schema.

Email text comes from the mail templates, which a workspace or
`CUSTOM_TEMPLATES` can override; see
[Sources and signers](sources-and-signers.md). A template body may be a src
reference; an email whose body fails to load is not sent. The `mailer` and
`mailer_body` [log keys](logging.md) log the sender, recipients and body.

## Obsolete variables

`TRANSPORT_PORT` and `TRANSPORT_TLS` still get defaults in `processEnv.js`,
but no module reads them since mail moved from SMTP to Resend in v5. They
have no effect. The v4
`TRANSPORT` and `TRANSPORT_HOST` variables are also ignored.
