# MAPP.UI App

The MAPP.UI app contains the MAPP.UI library source modules. The MAPP.UI library creates user interface elements for the mapview, layers and locations, eg. the layer and location views, dataviews, tabviews, the gazetteer, and the ui plugins which add buttons to the mapview.

## Requires the MAPP library

The MAPP.UI library doesn't import modules from the [MAPP app](../mapp/README.md). It uses the MAPP library through the `mapp` global, eg. `mapp.utils`, `mapp.dictionary`, `mapp.layer`, `mapp.user` and `mapp.hooks`. The MAPP and MAPP.UI bundles are released together with the same version.

The `mapp.js` script must be loaded before the `ui.js` script. When loaded, the ui module:

- assigns itself as `mapp.ui`,
- replaces `mapp.utils.alert()` and `mapp.utils.confirm()` with the ui alert and confirm elements,
- replaces `mapp.layer.drawLegend()` with the ui drawLegend method,
- assigns the ui plugins to `mapp.plugins`.

Loading `mapp.js` after `ui.js` replaces the `mapp` global and removes the ui. A plugin which extends a replaced method must wrap the current method.

## Build

From the repository root, build the app with Turborepo:

```bash
pnpm build --filter=@geolytix/mapp-ui
```

Build the MAPP and MAPP.UI bundles together with:

```bash
pnpm build --filter=@geolytix/mapp --filter=@geolytix/mapp-ui
```

From `apps/ui`, run the package build directly:

```bash
pnpm build
```

The build uses `apps/ui/vite.config.mjs` and writes `apps/ui/lib/ui.mjs` as `public/js/lib/ui.js` in the repository root. The mapp and ui apps both write into `public/js/lib`. The build doesn't empty the directory, so building one app keeps the bundle of the other.

The generated files and their sourcemaps are gitignored and must not be committed to a development branch. The release workflow commits them to `main` and the release tag, see [RELEASING.md](../../RELEASING.md).

For readable bundles during browser debugging, disable minification with `NODE_ENV=DEVELOPMENT`:

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp-ui
```

## CSS Bundle

The MAPP.UI build also bundles `apps/ui/css/_ui.css` through `apps/ui/vite.css.config.mjs` into `public/css/ui.css`. The generated `ui.css` is gitignored like the JavaScript bundles. The font files are written next to `ui.css` and are committed in `public/css`.

`ui.css` loads the fonts, the colour palette and the body styles, and styles the ui elements, eg. the layer legends. A colour theme set with the ui overrides the mapp colours.

## Related Docs

- MAPP app: [../mapp/README.md](../mapp/README.md)
- Root setup: [../../SETUP.md](../../SETUP.md)
- Contributor workflow: [../../DEVELOPING.md](../../DEVELOPING.md)
