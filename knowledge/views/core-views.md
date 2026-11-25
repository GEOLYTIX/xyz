---
type: Feature
title: Core views
description: What the default map view, the login and register view and the user admin view do on load; use when changing public/views or replacing the default view.
resource: ../../public/views/_default.html
tags: [views, mapp, ui, default-view, login]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: default
    resource: ../../public/views/_default.html
  - id: login
    resource: ../../public/views/_login.html
  - id: user
    resource: ../../public/views/_user.html
  - id: views
    resource: ../../apps/xyz/mod/workspace/templates/_views.js
  - id: mapview
    resource: ../../apps/mapp/lib/mapview/_mapview.mjs
  - resource: ../../apps/xyz/mod/user/login.js
  - resource: ../../apps/xyz/mod/user/register.js
  - resource: ../../apps/xyz/mod/user/admin.js
  - resource: ../../apps/ui/tests/default.spec.mjs
---
# Core views

`public/views/` holds the views the XYZ API ships. They are the core
templates of the [view API](view-api.md).[^views]

| File | Template keys | Served by |
| --- | --- | --- |
| `_default.html` | `default_view` | `/`, `${DIR}/`, `/view` |
| `_login.html` | `login_view`, `register_view`, `password_reset_view` | `/api/user/login`, `/api/user/register` |
| `_user.html` | `user_admin_view` | `/api/user/admin` for admins |

## Behaviour

The **default view** is the map application: a control panel with layers,
gazetteer and locations, the map with a button column, and a tab view below
the map for dataviews. It is the reference for a [custom view](custom-views.md).

The **login view** shows the login form for `login_view` and the register
form otherwise, with a language dropdown. The `msg` param shows a message,
eg. after a failed login.[^login]

The **user admin view** lists the ACL users in a Tabulator table loaded from
a CDN. It does not use the MAPP libraries.[^user]

## Flow

The default view script runs in this order:[^default]

1. `mapp.utils.mobile(765)` sets the width for the mobile layout.
2. `/api/user/cookie` refreshes the cookie and sets `mapp.user`, or `false`
   without an ACL. User properties stored in the browser's IndexedDB are
   merged in.
3. `mapp.language` is the `language` URL param, the user's language or
   `en`; other languages load their dictionary. See [language](language.md).
4. The resize handlers and the `tabview` [Tabview](../workspace/dataviews.md) are created.
5. `/api/workspace/locales` lists the locales. The `locale` URL param, the
   first listed locale or `locale` is loaded from
   `/api/workspace/locale?locale=…&layers=true`. A failure shows the
   `no_locales` dialog.
6. An object `locale` of the user is merged into the locale. A `userlocale`
   URL param replaces it with a locale stored for the user.
7. `locale.syncPlugins` defaults to `zoomBtn`, `admin`, `login`, and the
   `locale` URL param is set.
8. `mapp.Mapview` is created with `hooks: true`, `loadPlugins: true`,
   `scrollWheelZoom`, the control panel, the `#mapButton` column and the
   attribution. This loads and runs the [locale plugins](../workspace/locale/plugins.md).[^mapview]
9. `mapview.addLayer(locale.layers)`, then the layers listview, the
   gazetteer panel if `locale.gazetteer` is set, and the locations listview.
10. `mapview.interactions.highlight()` starts selection on hover and click.
11. Each `locations` hook (`layer!id`) is selected with `mapp.location.get`.
12. With a user and `locale.idle`, `mapp.ui.utils.idleLogout` logs out after
    the idle time.

## Where to change

- Layout, panels and start-up order: `public/views/_default.html`.
- To change the default view for one deployment, add a `default_view`
  template to the workspace instead of editing the file; see
  [custom views](custom-views.md).
- Login and register forms: `apps/ui/lib/elements/loginForm.mjs` and
  `registerForm.mjs`; the page: `public/views/_login.html`.

## Tests

`apps/ui/tests/default.spec.mjs` opens the default view with a test locale:
the libraries load, the layers panel lists the locale layers, and `locale`
and `z` are set as URL params.

## Pitfalls

- Buttons of the `zoomBtn`, `fullscreen` and other ui plugins are added to
  `mapview.mapButton`. A view without that element gets no buttons, and no
  error.
- The default view supports nested locales through the locales dropdown.
  A `locale` URL param of nested keys is comma separated, eg. `UK,London`.
- The user admin view reads `{{dir}}` only; it has no `{{language}}`.

[^views]: workspace/templates/_views.js
[^login]: _login.html and user/login.js
[^user]: _user.html and user/admin.js
[^default]: _default.html module script
[^mapview]: mapview/_mapview.mjs mapviewPromise
