# Testing

## What we test

| Suite | Location | Runs in | Tests |
|---|---|---|---|
| XYZ API | [apps/xyz/tests](apps/xyz/tests/) | Node | API modules, query templates, providers, user and workspace modules |
| MAPP library | [apps/mapp/tests](apps/mapp/tests/) | Headless Chromium | MAPP library modules against a local XYZ host |
| MAPP.UI library | [apps/ui/tests](apps/ui/tests/) | Headless Chromium | The XYZ default view with the MAPP.UI library against a local XYZ host |


## How we test

All suites use [Vitest](https://vitest.dev/).

**XYZ API tests** import the API modules in Node. Tests which need a database run against the [devdb](packages/devdb/README.md), eg. the query module tests. Dependencies the devdb can't provide, like login views or remote sources, are replaced with Vitest mocks. Requests and responses are created with `node-mocks-http`.

**MAPP library tests** run with [Vitest browser mode](https://vitest.dev/guide/browser/) in Chromium with the Playwright provider. The tests have the DOM, Openlayers and the `mapp` global. Vite serves the `apps/mapp/lib` source modules, so no build is required.

The global setup from [packages/testhost](packages/testhost/README.md) starts one devdb database and one XYZ host for the test run. The devdb can't create vector tiles, so the testhost [encodes the tiles](packages/testhost/README.md#vector-tiles) of mvt layers. The `mapp.host` is the testhost url, so `mapp.utils.xhr` requests the XYZ API with the test workspace.

**Test data** is the devdb seed data. The devdb is a [PGlite](https://pglite.dev) PostgreSQL database with PostGIS, which runs in memory in the Node process. Every run seeds a new database from the [seed files](packages/devdb/seed/).

**Workspaces** configure the layers and templates for the tests:

| Workspaces | Used by |
|---|---|
| [apps/xyz/tests/assets](apps/xyz/tests/assets/) | XYZ API tests |
| [apps/mapp/tests/workspaces](apps/mapp/tests/workspaces/) | MAPP library tests |
| [packages/testhost/workspaces](packages/testhost/workspaces/) | Test views and checks for bugs and features of a pull request |

Tests don't use the network. Openlayers is loaded from the `ol` package, the tile layers in test workspaces are not displayed, and requests to external services are stubbed.

The [osm template](packages/testhost/workspaces/templates/osm.json) is the base map of all test workspaces. Each workspace adds the template as the `osm` layer of its default locale, so every locale has the `osm` layer. The layer has `display: false`, and the testview workspace overrides it with `display: true`. The [tiles format tests](apps/mapp/tests/layer/format/tiles.test.mjs) use the layer, including its `style.contextFilter`.

## Running tests

Install the dependencies and the Chromium browser for the MAPP tests:

```bash
pnpm install
pnpm --filter=@geolytix/mapp exec playwright install chromium
```

Run all suites:

```bash
pnpm test
```

Run a suite:

| Command | Suite |
|---|---|
| `pnpm test:xyz` | XYZ API |
| `pnpm test:mapp` | MAPP library |
| `pnpm test:ui` | MAPP.UI library |

Run a single file or the tests matching a name from the package directory:

```bash
cd apps/mapp
pnpm test tests/layer/styleParser.test.mjs
pnpm test -t "graduated"
pnpm exec vitest run --reporter=verbose    # list every test with its result
```

The XYZ API `test` scripts run Vitest with the environment in [varlock/vanilla.env](varlock/vanilla.env). The tests assign the `xyzEnv` properties they need, so they also pass when Vitest runs without varlock, eg. in VS Code.

### Coverage

```bash
pnpm test:xyz:coverage
pnpm test:mapp:coverage
pnpm test:ui:coverage
```

The terminal shows the coverage per file, with the uncovered line numbers, and the totals. Run with Coverage in the [VS Code extension](#vs-code) highlights the covered and uncovered lines in the source.

The coverage runs also write an `lcov.info` for the SonarQube analysis in [CI](#ci): `coverage/lcov.info` for the XYZ API, `apps/mapp/coverage/lcov.info` for the MAPP library and `apps/ui/coverage/lcov.info` for the MAPP.UI library. The MAPP.UI coverage is from the module tests only.

The MAPP and MAPP.UI coverage have thresholds in [apps/mapp/vitest.config.mjs](apps/mapp/vitest.config.mjs) and [apps/ui/vitest.config.mjs](apps/ui/vitest.config.mjs). A coverage run fails if the coverage drops below the thresholds. Raise the thresholds when new tests increase the coverage.

### Debugging

**MAPP library tests** can run in a visible Chromium window:

```bash
cd apps/mapp
pnpm exec vitest --browser.headless=false tests/layer/styleParser.test.mjs
```

Open the DevTools in the browser window. The Sources panel has the `lib` source modules for breakpoints, and a `debugger;` statement in a test pauses the test. The Console shows the MAPP logs and the Network panel shows the requests to the testhost.

The testhost can serve a test workspace for a manual check in a browser:

```bash
pnpm testview --workspace=apps/mapp/tests/workspaces/_workspace.json
```

Open a locale of the workspace in the locale view, eg. http://127.0.0.1:3001/views/locale/?locale=smoke. The view has the layers of the locale with their feature count and a checkbox to show them, eg. the hidden OSM Basemap.

### VS Code

The [Vitest extension](https://marketplace.visualstudio.com/items?itemName=vitest.explorer) (`vitest.explorer`) is the preferred way to run, debug and check the coverage of tests.

The extension finds the `vitest.config.mjs` of each app and lists the tests by config in the Testing view. Each test has gutter icons in the editor to run or debug it.

| Action | Description |
|---|---|
| Run Test | Runs a test, a file or a suite. Failed assertions are shown inline in the editor. |
| Debug Test | Runs a test with the VS Code debugger. Breakpoints in the test and in the source modules pause the test. |
| Run with Coverage | Runs the tests with the coverage settings of the config. The editor highlights covered and uncovered lines, and the Test Coverage view lists the coverage per file. |
The extension runs the MAPP library tests in Chromium. Debug Test attaches the debugger to the browser, so breakpoints in `apps/mapp/lib` modules pause in VS Code. Debug a single test file at a time.

The MAPP coverage thresholds apply to coverage runs in the extension. A run with coverage for a single file reports a threshold error, which can be ignored.

### CI

The [Unit Tests](.github/workflows/unit_tests.yml) workflow runs `pnpm test` for pushes and pull requests to the `main`, `major`, `minor` and `patch` branches.

The [Build](.github/workflows/build.yml) workflow runs the XYZ API and MAPP library coverage for the SonarQube analysis.

## Writing tests

These conventions apply to all suites:

- One test file per module, mirroring the source path, eg. `apps/mapp/tests/layer/themes/categorized.test.mjs` for `apps/mapp/lib/layer/themes/categorized.mjs`.
- A `describe()` block per module or feature, with an `it()` test per behaviour. Use `it.each()` for the same behaviour with different input.
- Assert specific values, eg. a style colour, a feature count, a status code or a request param. Avoid snapshots of whole objects.
- Add seed files for new test data rather than changing existing seed rows, which tests depend on.
- Tests which write to the database use the empty `example.scratch_location` table. Each test inserts its own record, because all test files of a run share the devdb, and asserts only on its own records.
- A test for a known bug is written for the correct behaviour and marked with `it.fails()`, with a link to the issue. The test fails once the bug is fixed, and the `.fails` must be removed with the fix.
- Suppress expected console output and assert on it where the message is the behaviour.

See the [Vitest API](https://vitest.dev/api/) for the available test methods and assertions.

### XYZ API tests

[tests/setup.mjs](apps/xyz/tests/setup.mjs) runs before each test file and creates the `globalThis.xyzEnv`. A test which needs `xyzEnv` properties assigns them before it imports the module under test, because modules read the `xyzEnv` when they are imported.

**A devdb database** is started by a test file which needs a database. Tests should use the devdb rather than mocks where possible. A test against the devdb runs the real SQL and the real database responses, while a mocked database only returns what the test expects. See [query.test.mjs](apps/xyz/tests/mod/query.test.mjs):

```js
import { afterAll } from 'vitest';
import { startDevDb } from '../../../../packages/devdb/index.js';

const devdb = await startDevDb({ port: 0 });

afterAll(() => devdb.stop());

globalThis.xyzEnv = {
  WORKSPACE: 'file:./tests/assets/query_workspace.json',
  DBS_DEVDB: devdb.connectionString,
};
```

Add seed files to the [devdb](packages/devdb/README.md) for the data a test needs.

Mock the dependencies which the devdb can't provide, eg. login views, remote sources or a database error.

**Module mocks** replace the import of a module. `vi.mock()` calls are hoisted to the top of the file. Use a `vi.fn()` proxy to change the mock implementation in a test:

```js
import { describe, expect, it, vi } from 'vitest';

const fromACLFn = vi.fn();

vi.mock('@geolytix/xyz-app/mod/user/fromACL.js', () => ({
  default: (...args) => fromACLFn(...args),
}));

const { default: auth } = await import('@geolytix/xyz-app/mod/user/auth.js');

describe('auth', () => {
  it('returns the user from the acl', async () => {
    // The auth module receives this user from the mocked fromACL module.
    fromACLFn.mockImplementation(() => ({ email: 'test@geolytix.co.uk' }));

    // Call auth with a request and assert on the returned user.
  });
});
```

See [auth.test.mjs](apps/xyz/tests/mod/user/auth.test.mjs) for the complete tests.

**Request mocks** from `node-mocks-http` provide the `req` and `res` for an API module:

```js
import { createMocks } from 'node-mocks-http';

const { req, res } = createMocks({ params: { template: 'simple_select' } });

await query(req, res);

expect(res.statusCode).toBe(200);
expect(res._getData()).toEqual({ greeting: 'hello' });
```

**Fetch mocks** intercept `fetch` requests from API modules with the undici `MockAgent`:

```js
import { MockAgent, setGlobalDispatcher } from 'undici';

const mockAgent = new MockAgent();
setGlobalDispatcher(mockAgent);

mockAgent
  .get('https://example.com')
  .intercept({ path: '/workspace.json' })
  .reply(200, { locale: {} });
```

**Console mocks** from `mockConsole()` in [tests/scaffold.mjs](apps/xyz/tests/scaffold.mjs) replace a console method for the test file and collect the messages. Call it at the top level of a test file or in a `describe()` body, not in an `it()` test:

```js
import { mockConsole } from '../../scaffold.mjs';

const mockWarnings = mockConsole('warn');

it('warns about a potential SQL injection', () => {
  sql_table_insert(req);

  expect(mockWarnings[0]).toBe(
    'Potential SQL Injection in sql_table_insert request body.',
  );
});
```

### MAPP.UI library tests

The MAPP.UI library has two kinds of tests in `apps/ui/tests`:

| Tests | Files | Runner | Test |
|---|---|---|---|
| Module tests | `*.test.mjs`, mirroring `apps/ui/lib` | Vitest browser mode | A ui module, eg. an element, legend or infoj entry, with its params and edge cases |
| Default view tests | `*.spec.mjs` | Playwright Test | User flows in the XYZ default view across modules |

`pnpm test:ui` runs both. From `apps/ui`, `pnpm test:modules` runs the module tests and `pnpm test:view` the default view tests. `pnpm test:ui:coverage` reports the coverage of `apps/ui/lib` from the module tests.

#### Module tests

The module tests run like the [MAPP library tests](#mapp-library-tests), with the testhost global setup and the [UI test workspace](apps/ui/tests/workspaces/_workspace.json). [tests/setup.mjs](apps/ui/tests/setup.mjs) loads Openlayers, the MAPP library and the MAPP.UI library, which assigns itself as `mapp.ui`. Tests call the modules from `mapp.ui`:

```js
import { describe, expect, it, vi } from 'vitest';

const { chkbox } = mapp.ui.elements;

describe('ui/elements/chkbox', () => {
  it('calls onchange with the checked state and the val param', () => {
    const onchange = vi.fn();

    const node = chkbox({ label: 'Show', val: 'a', onchange });

    // A click on a checkbox which is not in the document doesn't dispatch a change event.
    document.body.append(node);

    node.querySelector('input').click();

    expect(onchange).toHaveBeenCalledWith(true, 'a');

    node.remove();
  });
});
```

Remove the elements which a test appends to the document, eg. dialogs and toasts, so they don't affect the next test.

#### Default view tests

The default view tests run with [Playwright Test](https://playwright.dev/docs/intro) and open the XYZ default view (`/view?locale={key}`) from the testhost. The tests use the view like a user, with Playwright locators for the panels, buttons and inputs.

The [playwright.config.mjs](apps/ui/playwright.config.mjs) starts the testhost with the [UI test workspace](apps/ui/tests/workspaces/_workspace.json). The testhost redirects the built bundles and stylesheets of the view to the MAPP and MAPP.UI source modules, so the tests don't require a build.

[tests/fixtures.mjs](apps/ui/tests/fixtures.mjs) provides the `test` with a `page` that serves Openlayers from the `ol` package for the CDN script of the view and aborts other external requests, and collects uncaught errors in `page.errors`. `openView(page, locale)` opens the default view and resolves once the view has added the layers and panels.

```js
import { expect, openView, test } from './fixtures.mjs';

test('lists the locale layers in the layers panel', async ({ page }) => {
  await openView(page, 'grocery');

  await expect(page.locator('#layers').getByText('OSM Basemap')).toBeVisible();
});
```

The tests run in one worker. With parallel pages, closing an HTTP socket in the testhost blocks the Node process for several seconds on Windows and the page loads time out.

Debug a test in a visible browser with `pnpm exec playwright test --headed` or step through it with `--debug` from `apps/ui`. A failed test keeps a trace in `test-results`, which opens with `pnpm exec playwright show-trace`.

### MAPP library tests

The MAPP library tests depend on the XYZ service running locally with a devdb database. The global setup from [packages/testhost](packages/testhost/README.md) starts the testhost with a new devdb database on a free port before the tests and stops it after the run, so no host needs to be started for the tests. The layer data, locales and query responses in the tests come from this host, not from mocks.

[tests/setup.mjs](apps/mapp/tests/setup.mjs) runs in the browser before each test file. It loads Openlayers and the MAPP library with the testhost as `mapp.host`. Most MAPP modules use the `mapp` global, so tests can call `mapp.*` or import a module from `lib` directly.

[tests/helpers.mjs](apps/mapp/tests/helpers.mjs) documents the seed rows and provides:

| Helper | Description |
|---|---|
| `getLocale(key)` | Requests a locale with its layers from the test workspace. |
| `createMapview(locale, view, params)` | Creates a mapview with additional mapview params, eg. an `attribution`. The mapview is disposed when the test finishes. |
| `addLayers(mapview)` | Adds the locale layers and awaits `mapview.renderComplete`. |
| `changeEnd(mapview)` | Resolves after the debounced `mapview.changeEnd` has called the layer `changeEnd` methods. Create the promise before the map view changes. |
| `sourceFeatures(layer)` | Returns the features of a vector layer sorted by id. |
| `newLocation(layer, values)` | Inserts a record with the location_new template and returns its id. |
| `getRecord(layer, id)` | Requests a record with the location_get template, or null without a record. |

A test suite which requests the XYZ API has its own locale file in [tests/workspaces/locales](apps/mapp/tests/workspaces/locales/). Add the locale file as a template to the [_workspace.json](apps/mapp/tests/workspaces/_workspace.json) and request the locale by its template key:

```json
"templates": {
  "smoke": {
    "src": "file:apps/mapp/tests/workspaces/locales/smoke.json"
  }
}
```

```js
import { describe, expect, it } from 'vitest';
import {
  addLayers,
  createMapview,
  getLocale,
  sourceFeatures,
} from './helpers.mjs';

describe('Smoke', () => {
  it('renders wkt layers with the devdb rows', async () => {
    const locale = await getLocale('smoke');

    const mapview = await createMapview(locale, { lat: 48, lng: 5, z: 4 });

    await addLayers(mapview);

    const ids = sourceFeatures(mapview.layers.locations).map((feature) =>
      feature.get('id'),
    );

    expect(ids).toEqual([1, 2, 3, 4]);
  });
});
```

Modules which don't request the API are tested without a locale, with layer, feature and style objects created in the test. Stub external libraries which `mapp.utils` loads from a CDN, eg. with `vi.spyOn(mapp.utils, 'esmImport')`.
