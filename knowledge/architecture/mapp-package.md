---
type: Guide
title: The @geolytix/mapp package
description: Using the MAPP library from npm or a CDN in a site that is not an XYZ view - Openlayers as a global, mapp.host, CORS_ORIGINS, cookies, CSP and version matching; use when embedding MAPP elsewhere or changing what the package ships.
resource: ../../apps/mapp/package.json
tags: [mapp, npm, cdn, cors, architecture]
status: draft
sources:
  - id: readme
    resource: ../../apps/mapp/README.md
  - id: entry
    resource: ../../apps/mapp/lib/mapp.mjs
  - id: cors
    resource: ../../apps/xyz/mod/middleware/cors.js
  - id: env
    resource: ../../apps/xyz/mod/utils/processEnv.js
  - id: auth
    resource: ../../apps/xyz/mod/user/auth.js
  - id: esm
    resource: ../../apps/mapp/lib/utils/esmImport.mjs
  - id: mapview
    resource: ../../apps/mapp/lib/mapview/_mapview.mjs
  - resource: ../../apps/xyz/tests/mod/middleware/cors.test.mjs
  - resource: ../../apps/mapp/tests-package/package.test.mjs
  - resource: ../../apps/mapp/scripts/pack.mjs
  - resource: ../../RELEASING.md
---
# The @geolytix/mapp package

The MAPP library is published to npm as `@geolytix/mapp` so that sites which
are not XYZ views can render XYZ layers. The [package README](../../apps/mapp/README.md)
is its npm page and has the install and usage snippets; this concept adds
the context across the [XYZ API](xyz-api.md) boundary. MAPP.UI is not
published; see [MAPP.UI](mapp-ui.md).

## What the package is

- `dist/mapp.js` (ES module bundle, with sourcemap) and `dist/mapp.css`,
  exported as `@geolytix/mapp` and `@geolytix/mapp/css`.[^readme]
- The import has side effects: it parses the URL hooks and assigns the `mapp`
  global. The default export is the same object.[^entry]
- The same bundle is served by XYZ as `public/js/lib/mapp.js`. An XYZ view
  and an npm site run the same code; only the host setup differs.

## Openlayers

`ol` is a peer dependency, but MAPP uses the `ol` **global**, not the `ol` ES
modules. Load `ol/dist/ol.js` as a classic script before importing MAPP.
The entry module warns when `ol` is missing or older than the version it
expects; it does not load it.[^entry] Bundling `ol` into the package is
caught by the size budget in [pack.mjs](../../apps/mapp/scripts/pack.mjs).

## The XYZ host

`mapp.host` is the XYZ base URL. In an XYZ view it comes from the head's
`data-dir`; elsewhere it is empty, and requests go to `/api` on the page's
origin. Set `mapp.host` after the import, or pass `host` to
`mapp.Mapview()`; a mapview without `host` uses `mapp.host`.[^mapview]

## Cross-origin pages

A page on another origin than XYZ needs the XYZ instance to allow it:

- **CORS.** Set `CORS_ORIGINS` on the XYZ instance to a comma separated list
  of origins, or `*`. The [cors middleware](../../apps/xyz/mod/middleware/cors.js)
  then answers preflights and sets `Access-Control-Allow-Origin` for those
  origins; credentials are never allowed.[^cors] Same-origin hosting, eg.
  behind a reverse proxy, needs no CORS.
- **Cookies.** The user cookie defaults to `SameSite=Strict` (`COOKIE_PROPS`),
  so the browser does not send it from another site.[^env] A cross-origin
  page is anonymous: it sees only locales and layers without role
  restrictions, and a `PRIVATE` instance redirects it to the login.
  Restricted data needs same-origin hosting or a token.
- **Tokens.** A request which sends a token explicitly, as an `Authorization`
  header or `token` param, is authenticated as the token's owner, also
  cross-origin.[^cors] Treat a token in a page like any credential.

The README's statement that the XYZ API sets no CORS headers predates
`CORS_ORIGINS` and is outdated.

## Content Security Policy

Some layer formats and utilities import modules at runtime from `esm.sh`,
eg. maplibre-gl, h3-js, proj4. A page with a CSP must allow
`https://esm.sh` in `script-src`.[^esm]

## Versions

- The package version is the XYZ release version, set by the version bump
  with the root and `mapp.mjs` versions; see [Monorepo](monorepo.md#versions).
- Releases without MAPP changes are not published, so versions have gaps.
  Prereleases use the `next` dist-tag.
- Use the package with an XYZ instance of the same minor version. The
  request params and the workspace keys MAPP sends must match what that XYZ
  version accepts.

## Where to change

- Package contents and checks: `apps/mapp/package.json` (`files`, `exports`,
  `peerDependencies`) and [scripts/pack.mjs](../../apps/mapp/scripts/pack.mjs).
  Keep the README usage sections in step; it is the npm page.
- Cross-origin behaviour: the cors middleware and its
  [tests](../../apps/xyz/tests/mod/middleware/cors.test.mjs).
- Publishing: the Publish MAPP workflow; see
  [Publishing the @geolytix/mapp package](../deployment/mapp-publishing.md).

## Tests

[tests-package/package.test.mjs](../../apps/mapp/tests-package/package.test.mjs)
installs the packed tarball, loads `ol` as a global, sets `mapp.host` to the
testhost and renders a locale, the way an npm site does. The MAPP Package
workflow runs it on pull requests through a local Verdaccio registry.

[^readme]: apps/mapp/README.md
[^entry]: apps/mapp/lib/mapp.mjs
[^cors]: apps/xyz/mod/middleware/cors.js
[^env]: apps/xyz/mod/utils/processEnv.js
[^esm]: apps/mapp/lib/utils/esmImport.mjs
[^mapview]: apps/mapp/lib/mapview/_mapview.mjs
