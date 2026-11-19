---
type: Feature
title: Workspace authorization
description: How workspace composition decides which templates, locales and layers a user receives, from roles or a pluggable authorization provider; use when changing access rules or integrating a policy store.
resource: ../../apps/xyz/mod/workspace/authorization.js
tags: [security, authorization, roles, workspace, xyz]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Authorization
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: security
    resource: https://github.com/GEOLYTIX/xyz/wiki/Security
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: authorization
    resource: ../../apps/xyz/mod/workspace/authorization.js
  - id: scopes
    resource: ../../apps/xyz/mod/workspace/scopes.js
  - id: compose
    resource: ../../apps/xyz/mod/workspace/composeObj.js
  - resource: ../../apps/xyz/tests/mod/workspace/authorization.test.mjs
  - resource: ../../apps/xyz/tests/mod/workspace/scopes.test.mjs
---
# Workspace authorization

## Behaviour

The XYZ API composes every locale and layer for the requesting user. Each
template merged into an object adds its `role` to the object's scope, eg.
`europe.france`. A template whose scope the user may not access is not
merged, so its content never reaches the user. How roles are written in a
workspace is described in [roles](../workspace/roles.md).

The decision for a scope is made by `authorizeScope`:[^authorization]

- **Roles** (default): access when the scope is empty or `*`, or the user has
  the scope as a role, or a role nested below it, eg. `europe.france.paris`
  grants `europe`.[^scopes] Admin routes bypass the check.
- **Provider**: a user with an `authorization_provider` property is decided by
  the provider registered under that key. The provider's async
  `checkScope(context)` receives `scope`, `scopeKey`, `obj` and `user` and
  must return `true`. A missing provider, another result or an error denies.

A user with a provider also skips the `roles` gate of locales and
layers; the provider alone decides.[^compose]

`/api/workspace/scopes` lists the scopes of the workspace for the admin
view; `/api/workspace/roles` is a deprecated alias.

## Flow

request → `getLocale` / `getLayer` → `composeObj` → `mergeTemplateIntoObj`
and `rolesTemplates` → `authorizeScope` → `checkScope` or provider.

## Where to change

- Register a provider in the host before serving:
  `setAuthorizationProvider('openfga', { async checkScope(context) { … } })`
  from `mod/workspace/authorization.js`; calling it without a provider
  removes the registration.
- The `authorization_provider` user property is set by the host, eg. in a
  custom login provider; it is not an ACL column.
- Scope semantics: `mod/workspace/scopes.js` exports `checkScope`,
  `getScopes`, `scopesArray` and `scopesTree` for hosts which evaluate scopes
  themselves.

## Tests

`authorization.test.mjs`, `scopes.test.mjs` and `composeObj.test.mjs` in
`apps/xyz/tests/mod/workspace/`.

## Pitfalls

- Since v5, `composeObj` takes the user object, not a roles array, and the
  authorization context has `user` instead of `roles`.

[^authorization]: workspace/authorization.js authorizeScope
[^scopes]: workspace/scopes.js checkScope
[^compose]: workspace/composeObj.js rolesTemplates
