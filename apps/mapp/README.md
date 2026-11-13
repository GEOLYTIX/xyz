# @geolytix/mapp

The MAPP library creates interactive [Openlayers](https://openlayers.org) mapviews with layers and locations from an [XYZ](https://github.com/GEOLYTIX/xyz) API. It works without the MAPP.UI library.

The package contains the ES module bundle `dist/mapp.js` with its sourcemap, and the mapview styles `dist/mapp.css`.

## Usage

The MAPP library requires Openlayers as the `ol` global. Load Openlayers before you import the MAPP library. The import assigns the library as the `mapp` global, and the package exports the same object as default export.

### CDN

```html
<script src="https://cdn.jsdelivr.net/npm/ol@v10.8.0/dist/ol.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@geolytix/mapp@5.1.0/dist/mapp.css">

<script type="module">
  import mapp from 'https://cdn.jsdelivr.net/npm/@geolytix/mapp@5.1.0/dist/mapp.js';

  // The url of the XYZ instance.
  mapp.host = 'https://xyz.example.com';

  const locale = await mapp.utils.xhr(
    `${mapp.host}/api/workspace/locale?locale=example&layers=true`,
  );

  const mapview = await mapp.Mapview({
    target: document.getElementById('map'),
    locale,
  });

  await mapview.addLayer(locale.layers);
</script>
```

### npm

```bash
npm install @geolytix/mapp ol
```

`ol` is a peer dependency. The MAPP library uses the `ol` global, not the `ol` ES modules. Load `ol/dist/ol.js` as a classic script before the MAPP library, eg. with your bundler's static asset handling or from a CDN.

```js
import mapp from '@geolytix/mapp';
import '@geolytix/mapp/css';
```

The import has side effects. It parses the URL hooks of the page and assigns the `mapp` global.

### The XYZ host

`mapp.host` is the url of the XYZ API. In an XYZ view it is read from the `data-dir` of the document head. Outside an XYZ view it is an empty string, and requests go to `/api` on the page origin. Set `mapp.host` after the import, or pass `host` to `mapp.Mapview()`.

A page on another origin than the XYZ instance needs:

- **CORS**: the XYZ API doesn't set CORS headers. Serve the page and the XYZ instance from the same origin, eg. behind a reverse proxy, or add the CORS headers in front of the XYZ instance.
- **Authentication**: the XYZ user cookie is `SameSite=Strict` by default, so the browser doesn't send it to the XYZ instance from a page on another site. Without the cookie, only public locales and layers are available.

### Content Security Policy

Some layer formats and utilities import modules at runtime from [esm.sh](https://esm.sh), eg. maplibre-gl, h3-js, proj4, convert and simple-statistics. A page with a Content Security Policy must allow `https://esm.sh` in its `script-src`.

### Versions

The package version is the XYZ release version. A release without MAPP library changes isn't published, so there are gaps between the versions. Prereleases are published with the `next` dist-tag.

Use the MAPP library with an XYZ instance of the same minor version.

## Development

The rest of this README is for developing the MAPP library in the [XYZ repository](https://github.com/GEOLYTIX/xyz).

The `apps/mapp` app contains the MAPP library source modules in `lib` and the styles in `css`. The MAPP.UI library is in the [MAPP.UI app](../ui/README.md). The MAPP library must not import or reference the MAPP.UI library. The code quality workflow fails if a module in `apps/mapp/lib` references `mapp.ui` or imports from the ui app.

### Build

From the repository root, build the app with Turborepo:

```bash
pnpm build --filter=@geolytix/mapp
```

Build the MAPP and MAPP.UI bundles together with:

```bash
pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
```

From `apps/mapp`, run the package build directly:

```bash
pnpm build
```

The build uses `apps/mapp/vite.config.mjs` and writes `apps/mapp/lib/mapp.mjs` as `dist/mapp.js` with its sourcemap. The css build writes `dist/mapp.css`. The `dist` directory is the content of the npm package, and the build empties it first.

[scripts/copyPublic.mjs](scripts/copyPublic.mjs) then copies the bundle, the sourcemap and the css into `public/js/lib` and `public/css` in the repository root for the XYZ views. The ui app also builds into `public/js/lib`.

The `dist` directory and the files in `public` are gitignored and must not be committed to a development branch. The release workflow commits the `public` files to `main` and the release tag, see [RELEASING.md](../../RELEASING.md).

To build against an environment-specific Varlock file, set the environment before running the build:

```bash
APP_ENV=production pnpm build --filter=@geolytix/mapp
```

Production SSR env injection is configured with `ssrInjectMode: 'resolved-env'`. The current build is client-only, so no SSR env blob is emitted. If an SSR build path is added and the schema enables encrypted blobs, provide `_VARLOCK_ENV_KEY` at build time and runtime.

For readable bundles during browser debugging, disable minification with `NODE_ENV=DEVELOPMENT`:

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
```

`NODE_ENV` is read directly by the Vite config for the minification toggle. Do not declare it in `.env.schema`, because platform-provided values should not be injected from a frozen environment.

### CSS Bundle

The MAPP build also bundles `apps/mapp/css/_mapp.css` through `apps/mapp/vite.css.config.mjs` into `dist/mapp.css`, which is copied to `public/css/mapp.css`.

`mapp.css` only styles mapview elements like the popup, infotip, attribution and Openlayers controls. It doesn't load fonts or define the colour palette. The colour variables in `mapp.css` fall back to the default palette values. `ui.css` from the MAPP.UI app loads the fonts, the colour palette and the body styles, and a colour theme set with the ui overrides the mapp colours.

### Tests

The library tests in `tests` run the source modules in the browser against the [testhost](../../packages/testhost/README.md), see [TESTING.md](../../TESTING.md):

```bash
pnpm test:mapp
```

### Package

The npm package is checked in three steps, from `apps/mapp` after the build:

```bash
pnpm pack:check     # packs .pack/geolytix-mapp.tgz, checks its files and manifest, and runs npm publish --dry-run
pnpm pack:install   # installs the tarball into tests-package/node_modules
pnpm test:package   # runs tests-package in the browser against the testhost
```

[scripts/pack.mjs](scripts/pack.mjs) packs the package from a staged copy with a package.json without the `devDependencies` and `scripts`. The tarball only has `dist`, the README, the licence and the package.json.

The [package test](tests-package/package.test.mjs) imports `@geolytix/mapp` by its name from `tests-package/node_modules`, loads Openlayers from the installed `ol` peer dependency, sets `mapp.host` and renders the layers of a locale from the testhost.

The [MAPP Package workflow](../../.github/workflows/mapp_package.yml) runs the same steps on pull requests, but publishes the tarball to a local Verdaccio registry and installs the package from there.

The package is published to npm with the Publish MAPP workflow, see [RELEASING.md](../../RELEASING.md#publish-the-mapp-library-to-npm).

### Testview

The [testview](../../packages/testhost/README.md) serves the `apps/mapp/lib` source modules with a local XYZ process and the devdb, and creates mapviews without the MAPP.UI library:

```bash
pnpm testview
```

The [cdn view](../../packages/testhost/README.md#cdn) loads a published version from jsDelivr instead.

### Related Docs

- MAPP.UI app: [../ui/README.md](../ui/README.md)
- Root setup: [../../SETUP.md](../../SETUP.md)
- Contributor workflow: [../../DEVELOPING.md](../../DEVELOPING.md)
- Releasing and publishing: [../../RELEASING.md](../../RELEASING.md)
