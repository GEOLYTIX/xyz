# @geolytix/xyz-testview

A test view for the MAPP library on its own, without the MAPP.UI library. It's the starting point for unit tests of the MAPP library and its modules.

The server starts an in-memory [devdb](../devdb/README.md) PGlite database and the XYZ API with the [workspace.json](workspace.json) in this package. The test view loads Openlayers and the MAPP library and creates 4 mapviews, each with an OSM base layer and one themed layer from the devdb seed tables.

| Mapview | Table | Theme |
|---|---|---|
| `locations_categorized` | `example.locations` | categorized on `category` |
| `locations_graduated` | `example.locations` | graduated on `id` |
| `features_categorized` | `example.features` | categorized on `category` with `count` distribution |
| `features_distributed` | `example.features` | distributed on `id` |

The package is listed in `.vercelignore` like devdb and is never deployed.

## Run

```bash
pnpm testview              # http://localhost:3001/testview/
pnpm testview --port=3002
pnpm testview --query-delay=1000
```

The `--query-delay` argument, or the `TESTVIEW_QUERY_DELAY` environment variable, delays the `/api/query` responses by the given milliseconds. With cached tiles and delayed layer data the testview must not be ready until the layer data has loaded.

No MAPP build is required. The server provides the source modules:

| Path | Content |
|---|---|
| `/testview` | [view/index.html](view/index.html) and [view/testview.mjs](view/testview.mjs) |
| `/mapp/lib` | `apps/mapp/lib` source modules |
| `/mapp/css` | `apps/mapp/css` source stylesheets |
| `/api` | The XYZ API with the testview workspace |

Openlayers is loaded from the jsdelivr CDN, the same version as the default view.

## Testing

The decorated mapviews are assigned to `window.testviews` by mapview key. `document.body.dataset.ready` is set once every mapview has rendered, so a browser test can wait for `body[data-ready]` before it makes assertions on the mapviews or layers.

Individual MAPP modules can be imported from `/mapp/lib` in the browser, eg. `import categorized from '/mapp/lib/layer/themes/categorized.mjs'`.
