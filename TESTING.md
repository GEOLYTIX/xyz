# Testing

## What we test

| Suite | Location | Runs in | Tests |
|---|---|---|---|
| XYZ API | [apps/xyz/tests](apps/xyz/tests/) | Node | API modules, query templates, providers, user and workspace modules |
| MAPP library | [apps/mapp/tests](apps/mapp/tests/) | Headless Chromium | MAPP library modules against a local XYZ host |

Tests for the MAPP.UI library will follow in `apps/ui/tests`.

## How we test

All suites use [Vitest](https://vitest.dev/).

**XYZ API tests** import the API modules in Node. Dependencies like database connections, login views or remote sources are replaced with Vitest mocks. Requests and responses are created with `node-mocks-http`. Tests which need real SQL run against the [devdb](packages/devdb/README.md), eg. the query module tests.

**MAPP library tests** run with [Vitest browser mode](https://vitest.dev/guide/browser/) in Chromium with the Playwright provider. The tests have the DOM, Openlayers and the `mapp` global. Vite serves the `apps/mapp/lib` source modules, so no build is required.

The global setup from [packages/testhost](packages/testhost/README.md) starts one devdb database and one XYZ host for the test run. The `mapp.host` is the testhost url, so `mapp.utils.xhr` requests the XYZ API with the test workspace.

**Test data** is the devdb seed data. The devdb is a [PGlite](https://pglite.dev) PostgreSQL database with PostGIS, which runs in memory in the Node process. Every run seeds a new database from the [seed files](packages/devdb/seed/).

**Workspaces** configure the layers and templates for the tests:

| Workspaces | Used by |
|---|---|
| [apps/xyz/tests/assets](apps/xyz/tests/assets/) | XYZ API tests |
| [apps/mapp/tests/workspaces](apps/mapp/tests/workspaces/) | MAPP library tests |
| [packages/testhost/workspaces](packages/testhost/workspaces/) | Test views and checks for bugs and features of a pull request |

Tests don't use the network. Openlayers is loaded from the `ol` package, test workspaces have no tile layers, and requests to external services are stubbed.

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

Each package has a `test:watch` script, which re-runs the affected tests on file changes. In watch mode, `f` re-runs the failed tests, `p` filters by file name and `t` filters by test name.

```bash
pnpm --filter=@geolytix/xyz-app test:watch
pnpm --filter=@geolytix/mapp test:watch
```

Run a single file or the tests matching a name from the package directory:

```bash
cd apps/mapp
pnpm test tests/layer/styleParser.test.mjs
pnpm test -t "graduated"
pnpm exec vitest run --reporter=verbose    # list every test with its result
```

The XYZ API tests run with the environment in [varlock/vanilla.env](varlock/vanilla.env). The package `test` scripts load it, so run the XYZ API tests through `pnpm test`, not `vitest` directly.

### Coverage

```bash
pnpm test:xyz:coverage
pnpm test:mapp:coverage
```

The terminal shows the coverage per file, with the uncovered lines, and the totals. The HTML reports show the uncovered lines and branches in the source of each file:

| Suite | HTML report | lcov |
|---|---|---|
| XYZ API | `coverage/lcov-report/index.html` | `coverage/lcov.info` |
| MAPP library | `apps/mapp/coverage/lcov-report/index.html` | `apps/mapp/coverage/lcov.info` |

The MAPP coverage has thresholds in [apps/mapp/vitest.config.mjs](apps/mapp/vitest.config.mjs). A coverage run fails if the coverage drops below the thresholds. Raise the thresholds when new tests increase the coverage.

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

Open a locale of the workspace in the locale view, eg. http://127.0.0.1:3001/views/locale/?locale=smoke. The view has the layers of the locale with their feature count, and an OSM base map.

**XYZ API tests** can be debugged in VS Code with a launch configuration for the node runtime:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug XYZ API tests",
  "autoAttachChildProcesses": true,
  "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--no-file-parallelism"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "cwd": "${workspaceFolder}/apps/xyz"
}
```

Add a test file to the `args` to debug a single file, eg. `"args": ["run", "--no-file-parallelism", "tests/mod/utils/merge.test.mjs"]`.

### CI

The [Unit Tests](.github/workflows/unit_tests.yml) workflow runs `pnpm test` for pushes and pull requests to the `main`, `major`, `minor` and `patch` branches.

The [Build](.github/workflows/build.yml) workflow runs the XYZ API and MAPP library coverage for the SonarQube analysis.

## Writing tests

These conventions apply to all suites:

- One test file per module, mirroring the source path, eg. `apps/mapp/tests/layer/themes/categorized.test.mjs` for `apps/mapp/lib/layer/themes/categorized.mjs`.
- A `describe()` block per module or feature, with an `it()` test per behaviour. Use `it.each()` for the same behaviour with different input.
- Assert specific values, eg. a style colour, a feature count, a status code or a request param. Avoid snapshots of whole objects.
- Add seed files for new test data rather than changing existing seed rows, which tests depend on.
- A test for a known bug is written for the correct behaviour and marked with `it.fails()`, with a link to the issue. The test fails once the bug is fixed, and the `.fails` must be removed with the fix.
- Suppress expected console output and assert on it where the message is the behaviour.

See the [Vitest API](https://vitest.dev/api/) for the available test methods and assertions.

### XYZ API tests

[tests/setup.mjs](apps/xyz/tests/setup.mjs) runs before each test file and creates the `globalThis.xyzEnv`. A test which needs `xyzEnv` properties assigns them before it imports the module under test, because modules read the `xyzEnv` when they are imported.

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

**A devdb database** is started by a test file which needs real SQL. See [query.test.mjs](apps/xyz/tests/mod/query.test.mjs):

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

### MAPP library tests

[tests/setup.mjs](apps/mapp/tests/setup.mjs) runs in the browser before each test file. It loads Openlayers and the MAPP library with the testhost as `mapp.host`. Most MAPP modules use the `mapp` global, so tests can call `mapp.*` or import a module from `lib` directly.

[tests/helpers.mjs](apps/mapp/tests/helpers.mjs) documents the seed rows and provides:

| Helper | Description |
|---|---|
| `getLocale(key)` | Requests a locale with its layers from the test workspace. |
| `createMapview(locale, view)` | Creates a mapview, which is disposed when the test finishes. |
| `addLayers(mapview)` | Adds the locale layers and awaits `mapview.renderComplete`. |
| `sourceFeatures(layer)` | Returns the features of a vector layer sorted by id. |

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

### Common issues

- **`xyzEnv is not defined`** — the module under test was imported before the `xyzEnv` was assigned. Assign the `xyzEnv` first and import the module with `await import()`.
- **A mock is not applied** — `vi.mock()` is hoisted above the variables in the file. Reference `vi.fn()` variables through a proxy function in the factory.
- **A mocked class can't be constructed** — arrow functions can't be called with `new`. Use class syntax in the `vi.mock()` factory, eg. for AWS SDK commands.
- **Async setup in a `describe()` body** — the tests may start before the setup has finished. Use `beforeAll()` instead.
- **`browserType.launch: Executable doesn't exist`** — Chromium is not installed for the Playwright version. Run `pnpm --filter=@geolytix/mapp exec playwright install chromium`, also after a Playwright update.
