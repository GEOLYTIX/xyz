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

The build uses `apps/mapp/esbuild.config.mjs` and writes bundled assets to `public/js` in the repository root.

## CSS Bundles

The root package exposes CSS bundle commands used by the host app:

```bash
pnpm mapp_css
pnpm ui_css
```

## Related Docs

- Root setup: [../../SETUP.md](../../SETUP.md)
- Contributor workflow: [../../DEVELOPING.md](../../DEVELOPING.md)
