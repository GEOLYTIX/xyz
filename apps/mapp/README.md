# MAPP App

The MAPP app contains the frontend MAPP and MAPP.UI source modules.

## Build

From the repository root, build the app with Turborepo:

```bash
pnpm build --filter=@geolytix/mapp
```

From `apps/mapp`, run the package build directly:

```bash
pnpm build
```

The build uses `apps/mapp/vite.config.mjs` and writes bundled assets to `public/js/lib` in the repository root. When a root `.env.schema` exists, Varlock loads env files from the repository root via this package's `varlock.loadPath` setting.

The Vite build has two library entry points:

- `apps/mapp/lib/mapp.mjs` becomes `public/js/lib/mapp.js`
- `apps/mapp/lib/ui.mjs` becomes `public/js/lib/ui.js`

Shared code may be emitted as additional chunk files in `public/js/lib`. The sourcemaps beside the generated files should be committed with the bundle output.

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

## CSS Bundles

The MAPP build also bundles `apps/mapp/css/_mapp.css` and `apps/mapp/css/_ui.css` through `apps/mapp/vite.css.config.mjs`. The generated CSS and font assets are written to the root `public/css` directory.

The root package also exposes CSS-only commands used by the host app:

```bash
pnpm mapp_css
pnpm ui_css
```

## Related Docs

- Root setup: [../../SETUP.md](../../SETUP.md)
- Contributor workflow: [../../DEVELOPING.md](../../DEVELOPING.md)
