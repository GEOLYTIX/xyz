---
type: Environment Variable
title: Workspace source and cache
description: WORKSPACE selects the JSON workspace and WORKSPACE_AGE controls cache expiry.
resource: ../../apps/xyz/mod/workspace/cache.js
tags: [xyz, environment, workspace]
status: draft
x-xyz-variables: [WORKSPACE, WORKSPACE_AGE]
sources:
  - resource: https://github.com/GEOLYTIX/xyz/wiki/Process-Environment/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/utils/processEnv.js
  - resource: ../../apps/xyz/mod/provider/getSrc.js
  - resource: ../../apps/xyz/mod/provider/file.js
  - resource: ../../apps/xyz/mod/workspace/cache.js
  - resource: ../../apps/xyz/tests/mod/workspace/cache.test.mjs
---
# Workspace source and cache

`WORKSPACE` identifies the JSON document loaded by the XYZ workspace cache.
`processEnv.js` copies environment values into `xyzEnv`; it does not supply a
default WORKSPACE source. Configure it using the environment setup described in
[local development](../deployment/local-development.md).

The source prefix selects a provider. The current provider registry includes
`file:`, `https:` and `cloudfront:`, plus signer providers derived from `SIGN_*`
keys. The Wiki's general claim that any HTTP URL is supported does not match
the current registry: there is no built-in `http:` provider.

```dotenv
WORKSPACE=file:/public/workspace.json
WORKSPACE_AGE=3600000
```

`public/workspace.json` is the minimal workspace in the repository, used by
[local development](../deployment/local-development.md). Local file paths are resolved relative to
`xyzEnv.XYZ_CWD`, which `processEnv.js` sets to the `XYZ_CWD` variable or the
repository root. A workspace describes
[default and named locales](../workspace/locales.md).

## Cache behavior

`WORKSPACE_AGE` defaults to `3600000` milliseconds, one hour. The cache compares
elapsed time against its numeric value when checked. A value of `0` expires the
cache on every check; the string `'0'` survives the environment defaulting step.
The `force` argument to `checkWorkspaceCache` also triggers a rebuild.

Rebuilding clears the provider source cache before fetching the workspace. A
failed fetch resets the cached promise so a later call can retry. Consult the
[cache implementation](../../apps/xyz/mod/workspace/cache.js) and
[tests](../../apps/xyz/tests/mod/workspace/cache.test.mjs) before altering this
behavior. Keep credentials out of workspace examples and source URLs.
