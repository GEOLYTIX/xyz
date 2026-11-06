# MAPP App

The MAPP app contains the MAPP library source modules. The MAPP library creates interactive Openlayers mapviews with layers and locations from the XYZ API, and works without the MAPP.UI library.

The MAPP.UI library is in the [MAPP.UI app](../ui/README.md). The MAPP library must not import or reference the MAPP.UI library. The code quality workflow fails if a module in `apps/mapp/lib` references `mapp.ui` or imports from the ui app.

## Build

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

The build uses `apps/mapp/vite.config.mjs` and writes `apps/mapp/lib/mapp.mjs` as `public/js/lib/mapp.js` in the repository root.

The mapp and ui apps both write into `public/js/lib`. The build doesn't empty the directory, so building one app keeps the bundle of the other.

The generated files and their sourcemaps are gitignored and must not be committed to a development branch. The release workflow commits them to `main` and the release tag, see [RELEASING.md](../../RELEASING.md).

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

## CSS Bundle

The MAPP build also bundles `apps/mapp/css/_mapp.css` through `apps/mapp/vite.css.config.mjs` into `public/css/mapp.css`. The generated `mapp.css` is gitignored like the JavaScript bundles.

`mapp.css` only styles mapview elements like the popup, infotip, attribution and Openlayers controls. It doesn't load fonts or define the colour palette. The colour variables in `mapp.css` fall back to the default palette values. `ui.css` from the MAPP.UI app loads the fonts, the colour palette and the body styles, and a colour theme set with the ui overrides the mapp colours.

## Testview

The [testview](../../packages/testhost/README.md) serves the `apps/mapp/lib` source modules with a local XYZ process and the devdb, and creates mapviews without the MAPP.UI library:

```bash
pnpm testview
```

## Related Docs

- MAPP.UI app: [../ui/README.md](../ui/README.md)
- Root setup: [../../SETUP.md](../../SETUP.md)
- Contributor workflow: [../../DEVELOPING.md](../../DEVELOPING.md)
