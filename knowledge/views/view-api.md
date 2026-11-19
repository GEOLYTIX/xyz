---
type: Feature
title: View API
description: How /view serves an HTML view template from the workspace and substitutes {{params}}; use when adding, overriding or debugging a view template.
resource: ../../apps/xyz/mod/view.js
tags: [views, xyz, template, html]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: view
    resource: ../../apps/xyz/mod/view.js
  - id: router
    resource: ../../apps/xyz/router.js
  - id: params
    resource: ../../apps/xyz/mod/middleware/validateRequestParams.js
  - id: language
    resource: ../../apps/xyz/mod/utils/languageTemplates.js
  - id: views
    resource: ../../apps/xyz/mod/workspace/templates/_views.js
  - resource: ../../apps/xyz/mod/middleware/validateRequestAuth.js
  - resource: ../../apps/xyz/mod/workspace/getTemplate.js
  - resource: ../../apps/xyz/tests/mod/view.test.mjs
  - resource: ../../apps/xyz/tests/assets/view.json
  - resource: ../../apps/xyz/tests/mod/utils/languageTemplates.test.mjs
---
# View API

A view is an HTML page that the XYZ API serves from a template in
`workspace.templates`. The browser loads the MAPP libraries and runs the
view's script. The API does not render the map; it only fills in a few
`{{params}}`.

## Behaviour

- **Routes.** `${DIR}/view/:template`, `${DIR}/view?template=…`, `${DIR}/`
  and `/` all call the view module.[^router] Without a `template` param the
  view is `default_view`. With a `DIR`, a request for `/` is redirected to
  `DIR`.
- **Core view templates.** `default_view` is
  [_default.html](core-views.md); `login_view`, `register_view` and
  `password_reset_view` are `_login.html`; `user_admin_view` is
  `_user.html`.[^views] Workspace templates with the same key replace them,
  and so do `CUSTOM_TEMPLATES`. See [templates](../workspace/templates.md).
- **Template lookup.** The template is a string `template`, a `src` loaded
  on first use (eg. `file:/public/views/_default.html`, resolved from
  `XYZ_CWD`), or a [language template](language.md) with one HTML string or
  src per language code. An unknown template key returns `400` with the
  error message.[^language]
- **Access.** The view routes pass through the authentication middleware. A
  `PRIVATE` instance redirects users without a login to the login view or
  `AUTH_PATH`. The view module does not check roles on the template.
- **Substitution.** `{{name}}` is replaced with the param of that name, or
  with an empty string when there is no such param.[^view] The params are
  the URL path and query params plus:

| Param | Value |
| --- | --- |
| `{{dir}}` | The `DIR` environment variable, the path prefix of the instance |
| `{{title}}` | The `TITLE` environment variable |
| `{{authPath}}` | The `AUTH_PATH` environment variable of a custom login provider |
| `{{login}}` | `true` if `PRIVATE` or `PUBLIC` is set, ie. the instance has an ACL |
| `{{language}}` | The `language` URL param if it is two lower case letters, otherwise `en` |
| `{{template}}` | The template key |
| `{{msg}}` | The language template of the `msg` param, used by the login view |

Only param values which are strings of `A-Z a-z 0-9 _ -` are substituted.
The values `true`, `false` and `null` are parsed into non-strings, and
`[a,b]` into arrays, so these are removed too.[^params] The user is never a
param; the browser requests it from `/api/user/cookie`.

## Flow

`router.js` → `validateRequestParams.js` (query into params, `language`
defaults to `en`) → `validateRequestAuth.js` (user, `PRIVATE` redirect) →
`view.js` → `languageTemplates.js` → `getTemplate.js` (cache, `src`) →
`{{param}}` substitution → HTML response.

## Where to change

- Params and substitution: `apps/xyz/mod/view.js`.
- Core view keys: `apps/xyz/mod/workspace/templates/_views.js`.
- The core views themselves: `public/views/`; see [core views](core-views.md).

## Tests

`apps/xyz/tests/mod/view.test.mjs` loads `tests/assets/view.json`: the
default view returns 200, `{{language}}` defaults to `en`, and a param
with a character outside the whitelist is removed. The default view in the
browser is tested by `apps/ui/tests/default.spec.mjs`.

## Pitfalls

- A placeholder name must be a letter followed by letters and digits.
  `{{auth_path}}` or `{{my-param}}` does not match, so it stays in the HTML
  as written.
- A param value with a dot, space or comma is removed, eg. `lat=51.5` or a
  nested `locale=UK,London`. Read such values in the browser from
  [URL hooks](url-hooks.md) instead.
- The Wiki says `{{language}}` falls back to the user's language. It does
  not: `validateRequestParams` sets `language` to `en` first, so only the
  URL param counts. The default view applies the user's language in the
  browser.
- Views are cached with the workspace. A changed `src` file is read again
  only after `WORKSPACE_AGE` or a cache reset.
- The public directory is served at both `${DIR}/public` and `${DIR}`. The
  core views use `{{dir}}/public/…`; do the same in custom views.

[^router]: router.js createRouter and middleware/rootRedirect.js
[^views]: workspace/templates/_views.js
[^language]: utils/languageTemplates.js with the view_template flag
[^view]: view.js
[^params]: middleware/validateRequestParams.js
