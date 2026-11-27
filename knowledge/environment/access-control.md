---
type: Environment Variable
title: Access control list
description: PRIVATE or PUBLIC connects the user ACL and turns on authentication; AUTH_PATH and LEGACY_ROLES change login and role checks; LOCATION_WRITES=legacy permits location writes without a layer config.
resource: ../../apps/xyz/mod/user/acl.js
tags: [xyz, environment, security, auth, acl, roles]
status: draft
x-xyz-variables: [PRIVATE, PUBLIC, AUTH_PATH, LEGACY_ROLES, LOCATION_WRITES]
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/user/acl.js
  - resource: ../../apps/xyz/mod/middleware/validateRequestAuth.js
  - resource: ../../apps/xyz/mod/user/auth.js
  - resource: ../../apps/xyz/mod/user/login.js
  - resource: ../../apps/xyz/mod/view.js
  - resource: ../../apps/xyz/mod/workspace/scopes.js
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/mod/query.js
  - resource: ../../apps/xyz/mod/workspace/templates/_locationAccess.js
  - resource: ../../apps/xyz/mod/workspace/templates/location_update.js
  - resource: ../../apps/saml/README.md
  - resource: ../../apps/xyz/tests/mod/user/acl.test.mjs
  - resource: ../../apps/xyz/tests/mod/utils/processEnv.test.mjs
  - resource: ../../apps/xyz/tests/mod/workspace/getLayer.test.mjs
  - resource: ../../apps/xyz/tests/mod/workspace/templates/_locationAccess.test.mjs
---
# Access control list

| Variable | Default | Purpose |
|---|---|---|
| `PRIVATE` | none | ACL connection; every request needs a user. |
| `PUBLIC` | none | ACL connection; login is optional. |
| `AUTH_PATH` | none | Path of the login provider, eg. `/saml`. |
| `LEGACY_ROLES` | none | Enables the legacy role check. |
| `LOCATION_WRITES` | none | `legacy` permits location writes which the layer config does not allow. |

## ACL connection

Without `PRIVATE` or `PUBLIC` an instance has no users: there is no login, every
request is anonymous. Set one of them.
If both are set, `PRIVATE` is used.

The value is a PostgreSQL connection string and the ACL table, separated by a
pipe. The schema defaults to `public`:

```dotenv
PRIVATE=postgres://user:password@host:5432/database|acl_schema.acl_table
```

A value without the `|table` part does not configure an ACL: no user can be
authenticated. With `PUBLIC` the instance serves every request
anonymously. With `PRIVATE` it fails closed: every request is redirected to
the login, and `/api/user/login` answers `405`. The ACL has its own connection pool with a 5 second connection timeout, separate from the
`DBS_*` connections. An error on an idle ACL connection is logged and does
not end the process.

A user token is only signed and verified with a `SECRET`; see
[Tokens and cookies](tokens-and-cookies.md).

## PRIVATE and PUBLIC

With `PRIVATE`, an API or view request without a valid user is redirected
(302) to the login. The originally requested path is kept in a
`<TITLE>_redirect` cookie for 60 seconds, so the login can return to it. The
login and register routes themselves do not require a user. Static files from
the `public` directory are served before authentication, to everyone.

With `PUBLIC`, anonymous requests are served, and users may log in for
content restricted by roles. Both modes pass `login=true` to
view templates, which shows the login and logout links.

## AUTH_PATH

`AUTH_PATH` sends the `PRIVATE` login redirect to `${DIR}${AUTH_PATH}/login`
instead of `${DIR}/api/user/login`. View templates receive it as `authPath`
for their login and logout links. Like `DIR` it is normalised with a leading
and without a trailing slash.

Set `AUTH_PATH=/saml` for an instance which logs users in through the
[SAML app](saml.md). `SAML_LOGIN` was removed in v5 and is ignored; replace it
with `AUTH_PATH=/saml`.

## LEGACY_ROLES

By default a user needs the joined template scope, eg. `admin.editor`, or a
role nested under it. With `LEGACY_ROLES` set, a user holding every part of
the scope as separate roles, eg. `admin` and `editor`, is also granted access.
It is a temporary provision for deployments migrating to the v5 scopes.

Any non-empty value enables it, including `false`. Unset the variable to
disable it.

## LOCATION_WRITES

Since v5.1.0 the location write queries are authorized by the layer config,
composed for the requesting user. Config nested in a layer `roles` object
only applies to users with that role, so roles can grant writes separately
from read access.

| Query | Permitted by |
|---|---|
| `location_new` | `layer.draw` |
| `location_update` | `infoj` entries with `edit` |
| `location_delete`, `locations_delete` | `layer.deleteLocation` or `layer.edit.delete` |
| `sql_table_insert` | a `csv_upload`, `csvupload` or `sqlinsert` config for the table |

A write must target `layer.table` or one of the `layer.tables`. A write which
the layer config does not allow gets a `403`.

`LOCATION_WRITES=legacy` executes such writes as before v5.1.0 and logs a
warning for each one. It is a temporary provision for plugins which write
without a layer config; add the layer config and unset the variable. Any
other value is ignored.

The legacy mode still applies the layer `filter.default`. It does not restore
replacing a json field which is only editable through `json_key` entries:
`location_update` merges only the editable keys and drops the others without
a warning.
