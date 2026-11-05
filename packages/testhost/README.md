# @geolytix/xyz-testhost

A local XYZ host for browser tests and test views of the MAPP library and, later, the MAPP.UI library.

The host starts an in-memory [devdb](../devdb/README.md) PGlite database and the XYZ API with a workspace file. It serves the MAPP source modules, so no build is required.

| Path | Content |
|---|---|
| `/views/{view}/` | The test views in [views/](views/) |
| `/mapp/lib` | `apps/mapp/lib` source modules |
| `/mapp/css` | `apps/mapp/css` source stylesheets |
| `/api` | The XYZ API with the host workspace |

The package is listed in `.vercelignore` like devdb and is never deployed.

## Run

```bash
pnpm testview                     # http://127.0.0.1:3001/views/testview/
pnpm testview --port=3002
pnpm testview --query-delay=1000
pnpm testview --workspace=apps/mapp/tests/workspaces/_workspace.json   # http://127.0.0.1:3001/views/locale/?locale=smoke
```

| Argument | Environment variable | Default |
|---|---|---|
| `--port` | `TESTHOST_PORT` | `3001` |
| `--query-delay` | `TESTHOST_QUERY_DELAY` | `0` |
| `--workspace` | `TESTHOST_WORKSPACE` | [workspaces/testview.json](workspaces/testview.json) |

The `--query-delay` delays the `/api/query` responses by the given milliseconds. With cached tiles and delayed layer data a view must not be ready until the layer data has loaded.

The workspace path is relative to the directory the command was run from. Changes to the workspace file apply without a restart.

## Use in Vitest

`globalSetup.js` starts a host on a free port for the run with the workspace from `TESTHOST_WORKSPACE`, and stops it afterwards:

```js
// vitest.config.mjs
process.env.TESTHOST_WORKSPACE = fileURLToPath(
  new URL('./tests/workspaces/_workspace.json', import.meta.url),
);

export default defineConfig({
  test: {
    globalSetup: ['@geolytix/xyz-testhost/globalSetup'],
    hookTimeout: 60000,
  },
});
```

The host url is provided as `inject('XYZ_HOST')` and `process.env.XYZ_HOST`. The devdb connection string is provided as `inject('DEVDB')`.

`startHost()` from [index.js](index.js) can also be called directly. It can only be called once per process, because the XYZ modules create the xyzEnv and the database pools when they are imported.

## Workspaces

The [workspaces/](workspaces/) directory holds workspaces for the testhost views and for checking bugs and features of a pull request, eg. `workspaces/bug_2988.json`:

```bash
pnpm testview --workspace=packages/testhost/workspaces/bug_2988.json
```

Open a locale of the workspace in the [locale view](#locale), eg. `/views/locale/?locale=bug_2988`.

Workspaces use the `DEVDB` connection and the devdb seed tables. Add new seed files to devdb for data a workspace needs.

The test suites of the libraries keep their workspaces next to the tests, eg. [apps/mapp/tests/workspaces](../../apps/mapp/tests/workspaces/).

## Test views

Each folder in [views/](views/) is a test view, served at `/views/{folder}/`. A view imports modules from `/mapp/lib` and fetches from `/api`. More complex views with scripts for specific MAPP API processes can be added as new folders.

### locale

The [locale view](views/locale/) creates a mapview for any locale of the workspace served by the host, eg. `/views/locale/?locale=smoke`. The root url redirects to the locale view if the host serves a workspace other than the testview workspace.

The mapview fits the extent of the vector features if the locale has no view. The scroll wheel zooms the map to check the layer behaviour on pan and zoom. The panel lists the layers with their feature count and a checkbox to show or hide them. The base map is the `osm` layer from the [osm template](workspaces/templates/osm.json) in the default locale of the workspace. It has `display: false`, so the tests don't request tiles, and is shown with its checkbox in the panel.

The mapview is assigned to `window.mapview`. `document.body.dataset.ready` is set once the mapview has rendered.

### testview

The testview requires the locale and layers of the default workspace. It doesn't work with other workspaces.

The [testview](views/testview/) loads Openlayers and the MAPP library and creates 4 mapviews with the [workspaces/testview.json](workspaces/testview.json) locale. Each mapview has the `osm` base layer from the [osm template](workspaces/templates/osm.json) and one themed layer from the devdb seed tables.

| Mapview | Table | Theme |
|---|---|---|
| `locations_categorized` | `example.locations` | categorized on `category` |
| `locations_graduated` | `example.locations` | graduated on `id` |
| `features_categorized` | `example.features` | categorized on `category` with `count` distribution |
| `features_distributed` | `example.features` | distributed on `id` |

The decorated mapviews are assigned to `window.testviews` by mapview key. `document.body.dataset.ready` is set once every mapview has rendered, so a browser test can wait for `body[data-ready]` before it makes assertions.

Openlayers is loaded from the jsdelivr CDN, the same version as the default view.
