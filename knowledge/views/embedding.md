---
type: Guide
title: Embedding views and maps
description: Choosing between linking to a view, framing a view and using the MAPP package in another site, and what each needs from the XYZ instance; use when a map must appear outside the default view.
resource: ../../apps/ui/lib/elements/reportLink.mjs
tags: [views, embedding, iframe, mapp]
status: draft
sources:
  - id: wiki
    resource: https://github.com/GEOLYTIX/xyz/wiki/Application-Views/3fc379b7ada42dff57f19e9f28694868e5a17cac
    x-xyz-revision: 3fc379b7ada42dff57f19e9f28694868e5a17cac
  - id: link
    resource: ../../apps/ui/lib/elements/reportLink.mjs
  - id: env
    resource: ../../apps/xyz/mod/utils/processEnv.js
  - id: hooks
    resource: ../../apps/mapp/lib/hooks.mjs
  - id: cdn
    resource: ../../packages/testhost/views/cdn/cdn.mjs
  - resource: ../../apps/ui/tests/elements/reportLink.test.mjs
---
# Embedding views and maps

There are three ways to show an XYZ map outside the default view.

## Link to a view

A link to `${DIR}/view/<template>?…` opens a [custom view](custom-views.md)
in its own tab. [URL hooks](url-hooks.md) pass the locale, view, layers
and locations. The view runs on the XYZ origin, so the user's login works
as usual. Report links from layers and locations work this way; see
[report views](linked-views.md).

## Frame a view

An `<iframe>` with the same URL shows the view inside another page. The ui
`reportLink` element does this for `report.dialog: true`, from the same
origin.[^link]

- From the same site the frame shares the user's login.
- From another site the browser does not send the user cookie, which is
  `SameSite=Strict` by default (`COOKIE_PROPS`).[^env] The frame is
  anonymous: a `PRIVATE` instance shows its login, and a `PUBLIC` instance
  shows only what needs no role.
- Give the frame a fixed height; views size the map to the page.
- A `token` URL param authenticates the request as the token's owner.
  MAPP removes it from the URL and the hooks when it loads.[^hooks] Any
  page which holds the token can use it.

## Use the MAPP package

A site can import `@geolytix/mapp` from npm or a CDN, set `mapp.host` to
the XYZ instance and build its own mapview. MAPP.UI is not published, so
such a page has no ui elements or ui plugins. The instance must list the
site in `CORS_ORIGINS`. See
[the @geolytix/mapp package](../architecture/mapp-package.md) and the
working page in `packages/testhost/views/cdn`.[^cdn]

## Choosing

| Need | Use |
| --- | --- |
| A full page for a location or a print layout | Link to a view |
| A map inside a page on the same site | Frame a view |
| A map inside a page on another site, public data | MAPP package or frame |
| Restricted data on another site | Host the page on the XYZ origin, or a reverse proxy |

## Pitfalls

- A framed view still writes URL hooks into the frame's URL, not the
  parent page's.
- Do not hardcode the host in a view. Use `data-dir="{{dir}}"`; a
  hardcoded host breaks when `DIR` changes.

[^link]: elements/reportLink.mjs iFrameDialog
[^env]: utils/processEnv.js COOKIE_PROPS
[^hooks]: hooks.mjs parse
[^cdn]: testhost views/cdn/cdn.mjs
