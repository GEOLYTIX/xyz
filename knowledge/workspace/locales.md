---
type: Workspace Key
title: Default and named locales
description: workspace.locale supplies defaults and workspace.locales holds named locale configurations.
resource: ../../apps/xyz/mod/workspace/getLocale.js
tags: [workspace, locale, mapp]
status: draft
sources:
  - resource: https://github.com/GEOLYTIX/xyz/wiki/Workspace-Configuration
    revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - resource: ../../apps/xyz/mod/workspace/cache.js
  - resource: ../../apps/xyz/mod/workspace/getLocale.js
  - resource: ../../apps/xyz/mod/workspace/composeObj.js
  - resource: ../../apps/xyz/tests/mod/workspace/getLocale.test.mjs
---
# Default and named locales

A locale groups configuration used by a MAPP mapview. `workspace.locale` is the
default locale and provides defaults when resolving a named locale.
`workspace.locales` maps names to locale objects.

Structured Workspace Key metadata for generating and validating
workspaces is planned with the workspace split in issue #3007.

When missing, the workspace cache initializes `workspace.locale` to
`{ "layers": {} }` and `workspace.locales` to an object with a `locale` entry
pointing to that default. An explicitly empty `locales` object is kept.

## Resolution

`getLocale` defaults the requested key to `locale`. For another key it first
looks in `workspace.locales`, then attempts to load a matching template. It
composes the result with defaults and applies authorization through `composeObj`.
The locale's name defaults to its key when null or undefined. A request may also
specify a comma-separated sequence or array of keys for nested locales.

```json
{
  "locale": { "layers": {} },
  "locales": {
    "overview": { "name": "Overview" }
  }
}
```

This minimal example illustrates defaults and naming; it has no rendered layers.
It is not a full application workspace. Configure the
[workspace source](../environment/workspace.md) separately.

## Constraints for generated workspaces

- Reuse default locale configuration where appropriate, then compose named
  locales through the host API.
- Do not infer user access from the presence of a locale key. Composition may
  reject a locale or filter its layers according to the requesting user.
- Check template composition and nested locale behavior against
  [getLocale tests](../../apps/xyz/tests/mod/workspace/getLocale.test.mjs) before
  producing more complex examples.
