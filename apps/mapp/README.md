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

The build uses `apps/mapp/vite.config.mjs` and writes bundled assets to `public/js/lib` in the repository root. Varlock loads env files from the repository root via this package's `varlock.loadPath` setting.

The Vite build has two library entry points:

- `apps/mapp/lib/mapp.mjs` becomes `public/js/lib/mapp.js`
- `apps/mapp/lib/ui.mjs` becomes `public/js/lib/ui.js`

Shared code may be emitted as additional chunk files in `public/js/lib`. The sourcemaps beside the generated files should be committed with the bundle output.

To build against an environment-specific Varlock file, set the environment before running the build:

```bash
APP_ENV=production pnpm build --filter=@geolytix/mapp
```

Production SSR env injection is configured with `ssrInjectMode: 'resolved-env'` and `.env.schema` enables encrypted injected env blobs for `APP_ENV=production`. The current build is client-only, so no SSR env blob is emitted. Serverless platforms must provide `_VARLOCK_ENV_KEY` at build time and runtime if an SSR build path is added.

The root schema also enables Varlock's Google Secret Manager plugin. Use `GCP_PROJECT_ID` plus `gsm()` values in root env files when build servers should resolve config from Google Secret Manager. See VARLOCK.md.

For readable bundles during browser debugging, disable minification with `NODE_ENV=DEVELOPMENT`:

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
```

`NODE_ENV` is read directly by the Vite config for the minification toggle. It is intentionally not declared in `.env.schema`, because platform-provided values should not be injected from a frozen environment.

## CSS Bundles

The root package exposes CSS bundle commands used by the host app:

```bash
pnpm mapp_css
pnpm ui_css
```

## Related Docs

- Root setup: [../../SETUP.md](../../SETUP.md)
- Contributor workflow: [../../DEVELOPING.md](../../DEVELOPING.md)
