# Testing

XYZ/MAPP testing is split into 3 sections:

- CLI [Command Line Interface] tests for endpoints of the XYZ API.
- Front-end tests for the modules bundled into the MAPP library.
- Integrity tests for workspaces and XYZ process environments.

The first two run on Vitest under `pnpm test`. Only the integrity tests still run in a browser against a deployed instance.

## Migrating from Codi to Vitest

The server-side (CLI) test suite has been migrated from the [codi-test-framework](https://www.npmjs.com/package/codi-test-framework) to [Vitest](https://vitest.dev/).

Codi was originally used for both browser and server-side tests. It provided `describe`, `it`, `assertTrue`, `assertEqual`, and similar functions, loaded at runtime via ESM from `https://esm.sh/codi-test-framework`. This worked well in the browser where the full `mapp` global and DOM are available, but was a poor fit for server-side unit testing:

- Tests that called `mapp.utils.xhr(...)` could not run without a live Express server and browser environment.
- There was no mocking system, making it impossible to isolate modules from their dependencies (database connections, file system, external APIs).
- Test discovery was manual — each file had to be explicitly wired up.
- There was no coverage reporting, watch mode, or CI integration out of the box.

Vitest solves all of these problems. It is a Vite-native test framework with built-in mocking (`vi.mock`, `vi.fn`), snapshot testing, code coverage (v8 provider), watch mode, parallel execution, and first-class ESM support — which is important since the XYZ codebase is `"type": "module"` throughout.

> [!NOTE] The front-end suite has since migrated too, and now runs on Vitest in `@geolytix/mapp` -- see [Front-end tests for the MAPP library](#front-end-tests-for-the-mapp-library). Codi is retained for the integrity tests alone, which assert that a deployed instance is correctly configured and so have to run in a browser against the live application. Those are loaded by the [Test Plugin](https://github.com/GEOLYTIX/xyz/blob/main/apps/mapp/lib/plugins/test.mjs).

### What changed

Previously, `tests/mod/query.test.mjs` contained a `describe.skip()` block with 5 tests that depended on `mapp.utils.xhr()` — a browser-only function. These tests could never run in Node.js and were effectively dead code in the CI pipeline.

The file has been rewritten as 19 proper server-side unit tests that exercise `mod/query.js` directly by:

- Mocking `mod/utils/dbs.js` with a Proxy so no real PostgreSQL connection is needed.
- Mocking `mod/user/login.js` to return a 401 with the message key, avoiding view template rendering.
- Using a dedicated `tests/assets/query_workspace.json` fixture loaded via `checkWorkspaceCache(true)`.
- Using `createMocks` from `node-mocks-http` to simulate HTTP request/response objects.

The tests now cover template resolution errors, auth checks (login, admin, roles), query execution (single/multiple rows, empty results, database errors), response formatting (reduce, value_only), parameter substitution and SQL injection rejection, invalid database connections, and nonblocking queries.

## CLI [Command Line Interface] tests

Command Line Interface tests are typically executed on localhost for a clone of the XYZ repository to check whether XYZ API modules under development execute as outlined in their documentation. These tests should also be run as an action on any pull request to ensure the structural integrity of XYZ API endpoints.

CLI tests use [Vitest](https://vitest.dev/) as the test framework. Vitest must be installed into the node_modules with `pnpm install`.

### Running tests

Run the full test suite:

```bash
pnpm test
```

This runs `turbo run test`, which runs the `test` script of every package in the workspace -- `varlock run -- vitest run` for `@geolytix/xyz-app`, and the `lib` and `browser` projects for `@geolytix/mapp`.

Watch mode re-runs affected tests on file changes:

```bash
pnpm --filter=@geolytix/xyz-app test:watch
```

Run a single test file:

```bash
pnpm exec varlock run -- vitest run apps/xyz/tests/mod/query.test.mjs
```

Run tests matching a name pattern:

```bash
pnpm exec varlock run -- vitest run -t "should return 400"
```

### Coverage

Generate a coverage report with the v8 provider:

```bash
pnpm test:xyz:coverage
```

This runs `varlock run -- vitest run --coverage` and prints a table showing statement, branch, function, and line coverage for every file under `mod/`.

### Configuration

Vitest is configured via `vitest.config.mjs` at the project root:

```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/mod/**/*.test.mjs', 'tests/plugins/**/*.test.mjs'],
    exclude: ['tests/lib/**', 'tests/browser/**', 'tests/_mapp.test.mjs'],
    setupFiles: ['tests/setup.mjs'],
    testTimeout: 10000,
    fileParallelism: true,
    coverage: {
      provider: 'v8',
    },
  },
});
```

Key points:

- Only `tests/mod/**` and `tests/plugins/**` are included. The MAPP library has its own suites in the `@geolytix/mapp` package — see [Front-end tests for the MAPP library](#front-end-tests-for-the-mapp-library).
- `tests/setup.mjs` ensures `globalThis.xyzEnv` exists before any test module loads.
- Tests run in parallel across files with a 10-second timeout per test.

### CI Pipeline

Tests run automatically on every push and pull request to `main`, `major`, `minor`, and `patch` branches via the GitHub Actions workflow in `.github/workflows/unit_tests.yml`:

```yaml
- name: Install Dependencies
  run: pnpm install --ignore-scripts

# The browser project needs a real Chromium. Cached on the resolved
# playwright version, so the download is a one off per version bump.
- name: Install Playwright Chromium
  run: pnpm exec playwright install --with-deps chromium

- name: Run tests
  run: pnpm test
```

### Debugging tests

Vitest tests can be launched in debug mode with VSCode by adding a debug config for the node runtime to the launch.json.

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest Tests",
  "autoAttachChildProcesses": true,
  "skipFiles": ["<node_internals>/**", "**/node_modules/**"],
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "--no-file-parallelism"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "cwd": "${workspaceFolder}"
}
```

To debug a single test file, add the file path to `args`:

```json
"args": ["run", "--no-file-parallelism", "tests/mod/utils/merge.test.mjs"]
```

### /tests/mod directory

The `/tests/mod` directory contains tests for the individual XYZ API endpoints and utility modules. Vitest discovers test files automatically by matching the glob patterns defined in `vitest.config.mjs`. Each `.test.mjs` file is a standalone test module.

### Test structure [describe > it > expect]

A test module will usually import modules to be tested and wrap tests in `describe()` blocks which define a group of related tests.

Multiple `it()` methods can be used within each `describe()` block to test individual aspects of a module.

Multiple assertions can be checked with `expect()` methods inside an `it()` test. Each assertion must pass for the test to succeed.

```javascript
import { describe, it, expect } from 'vitest';

describe('Feature Description', () => {
  it('should behave in a specific way', () => {
    const result = myFunction();
    expect(result).toEqual(expectedValue);
  });
});
```

For example: The test module for the /user/token module imports the token and auth modules. The describe block then contains multiple `it()` tests to check whether the module correctly responds to mocked HTTP requests with missing or valid parameters. An `it()` test for a missing parameter validates with `expect(response).toBeInstanceOf(Error)`. Multiple `it()` tests can be chained by storing variables within the closure of the `describe()` block. An `it()` test with a valid request user parameter stores the returned token for a subsequent `it()` test to pass to the auth module and check whether the expected user object is returned.

### Mocks

Vitest provides a built-in mocking system that does not require any experimental Node.js flags.

Mocking replaces the reference of a module or function in memory with a 'mocked' version of it. This mocked version can then be called from non-test code and receive a controlled output.

Vitest automatically cleans up mocks between test files, so manual restoration is not required.

#### Function mocking

To mock a function you can call `vi.fn()`.

```javascript
import { it, expect, vi } from 'vitest';

const random = vi.fn((max) => Math.floor(Math.random() * max));

it('random', () => {
  expect(random(1)).toEqual(0);
  expect(random(3) <= 2).toBeTruthy();
});
```

#### Module mocking

The `vi.mock()` function takes the path of a module to mock and a factory function that returns the mocked module's exports.

> [!IMPORTANT] `vi.mock()` calls are hoisted to the top of the file by Vitest's transform. To reference mutable variables inside the factory, use a proxy pattern with `vi.fn()`.

In the following example the acl method is mocked as the default export for the acl module. The mock implementation returns a user object without requiring access to a real database.

```javascript
import { describe, it, expect, vi } from 'vitest';

const aclFn = vi.fn();

vi.mock('../../acl.js', () => ({
  default: (...args) => aclFn(...args),
}));

describe('mocked module', () => {
  it('should return a mocked user from acl', async () => {
    aclFn.mockImplementation(() => {
      return {
        email: 'robert.hurst@geolytix.co.uk',
        admin: true,
      };
    });

    const { default: login } = await import('../../../mod/user/login.js');
    const result = await login();

    expect(result.email).toEqual('robert.hurst@geolytix.co.uk');
  });
});
```

#### HTTP mocks

Node HTTP requests and responses can be mocked to test endpoints in the middleware.

The `createMocks` function from `node-mocks-http` creates `req` & `res` objects that can be passed to functions to simulate API calls.

```javascript
import { describe, it, expect } from 'vitest';
import { createMocks } from 'node-mocks-http';

const { default: userToken } = await import('../../../mod/user/token.js');

describe('token', () => {
  it('10hr admin user token', async () => {
    const { req, res } = createMocks({
      params: {
        expiresin: '10hr',
        user: {
          email: 'test@geolytix.co.uk',
        },
      },
    });

    await userToken(req, res);

    const token = res._getData();

    const user = jwt.verify(token, xyzEnv.SECRET, {
      algorithm: xyzEnv.SECRET_ALGORITHM,
    });

    // token expires in 10hr.
    expect(user.exp - user.iat === 36000).toBeTruthy();

    // user from token must not have admin rights.
    expect(!user.admin).toBeTruthy();
  });
});
```

You can also mock the response from the global fetch function by using `MockAgent` and `setGlobalDispatcher` from `undici`.

The `MockAgent` class creates a mock pool which intercepts requests to specific URLs. The `setGlobalDispatcher` assigns the agent globally so that `fetch` calls in non-test modules are intercepted.

```javascript
import { describe, it, expect } from 'vitest';
import { MockAgent, setGlobalDispatcher } from 'undici';

describe('HTTP Mock', () => {
  it('should intercept fetch requests', async () => {
    const mockAgent = new MockAgent();
    setGlobalDispatcher(mockAgent);

    const mockPool = mockAgent.get(new RegExp('http://localhost:3000'));
    mockPool
      .intercept({ path: '/' })
      .reply(404, ['codi', 'mieka', 'luci']);

    const response = await fetch('http://localhost:3000');

    expect(response.status).toEqual(404);
    expect(await response.json()).toEqual(['codi', 'mieka', 'luci']);
  });
});
```

### Available Assertions

Vitest provides a rich set of assertions via the `expect()` API:

- `expect(actual).toEqual(expected)` - Asserts deep equality
- `expect(actual).toBe(expected)` - Asserts strict reference equality
- `expect(actual).toBeTruthy()` - Asserts the value is truthy
- `expect(actual).toBeFalsy()` - Asserts the value is falsy
- `expect(actual).toBeInstanceOf(Class)` - Asserts the value is an instance of a class
- `expect(actual).toContain(item)` - Asserts an array or string contains the item
- `expect(actual).toBeNull()` - Asserts the value is null
- `expect(actual).toBeDefined()` - Asserts the value is not undefined
- `expect(fn).toThrow(message)` - Asserts the function throws an error
- `expect(actual).toMatchSnapshot()` - Asserts against a stored snapshot

For the full list, see the [Vitest expect API](https://vitest.dev/api/expect).

### Best Practices

- Maintain parallel structure between source and test directories
- Use descriptive test names
- One describe per test suite
- Group related tests in the same describe block
- Keep tests focused and isolated
- Use `beforeAll` / `afterAll` for async setup and teardown (e.g. loading workspace caches)
- Avoid putting async setup directly in `describe` bodies -- use `beforeAll` instead

### Test Discovery

Vitest automatically discovers tests matching the glob patterns in `vitest.config.mjs`:

- `tests/mod/**/*.test.mjs`
- `tests/plugins/**/*.test.mjs`

### Common Issues and Solutions

1. **`xyzEnv is not defined`** - Ensure `tests/setup.mjs` is listed in `setupFiles` in `vitest.config.mjs`. If a specific test needs additional `xyzEnv` properties, set them in a `beforeAll` hook.
2. **Mock not applied** - `vi.mock()` calls are hoisted. Use the `(...args) => mockFn(...args)` proxy pattern to reference `vi.fn()` variables inside the factory.
3. **Constructor mock fails** - Arrow functions cannot be called with `new`. Use class syntax in the `vi.mock` factory for modules that export classes (e.g. AWS SDK commands).
4. **Async describe body race conditions** - Do not `await` async operations directly in `describe` callbacks. Use `beforeAll` instead.
5. Check file extensions are `.mjs`
6. Verify import/export syntax is ESM compatible

## Current Coverage

Overall: **61.9% statements, 55.3% branches, 65.4% functions, 62.6% lines**

### Well-covered modules (>80% statements)

| Module | Stmts | Branch |
|---|---|---|
| `mod/utils/merge.js` | 100% | 96% |
| `mod/utils/roles.js` | 96% | 93% |
| `mod/user/token.js` | 100% | 100% |
| `mod/user/list.js` | 100% | 85% |
| `mod/user/log.js` | 94% | 94% |
| `mod/user/auth.js` | 85% | 82% |
| `mod/user/cookie.js` | 85% | 81% |
| `mod/user/delete.js` | 89% | 86% |
| `mod/workspace/cache.js` | 89% | 80% |
| `mod/workspace/getLocale.js` | 95% | 93% |
| `mod/workspace/mergeTemplates.js` | 88% | 87% |
| `mod/provider/cloudfront.js` | 92% | 90% |

### Modules that need tests

| Module | Stmts | Priority |
|---|---|---|
| `mod/view.js` | 0% | High |
| `mod/user/login.js` | 3% | High |
| `mod/user/fromACL.js` | 13% | High |
| `mod/utils/redirect.js` | 0% | Medium |
| `mod/utils/resend.js` | 11% | Medium |
| `mod/utils/logger.js` | 29% | Medium |
| `mod/utils/envReplace.js` | 44% | Medium |
| `mod/provider/getFrom.js` | 53% | Medium |
| `mod/sign/_sign.js` | 52% | Medium |
| `mod/workspace/_workspace.js` | 52% | Medium |
| `mod/query.js` | 51% | Medium |
| `mod/user/register.js` | 59% | Medium |

### Query template render functions (0% coverage)

The 28 query template files under `mod/workspace/templates/` are almost entirely at 0% coverage. Only `layer_extent.js` and `sql_table_insert.js` have tests. The remaining 26 templates are pure functions or string constants that take params and return SQL. They are the easiest modules to unit test — import the render function directly and assert on the generated SQL string. No mocking is required.

Templates at 0%: `cluster`, `cluster_hex`, `geojson`, `mvt`, `mvt_geom`, `wkt`, `location_get`, `location_new`, `location_update`, `location_delete`, `locations_delete`, `location_field_value`, `location_count`, `histogram`, `infotip`, `get_nnearest`, `get_random_location`, `distinct_values`, `distinct_values_json`, `field_max`, `field_min`, `field_minmax`, `field_stats`, `gaz_query`, `st_distance_ab`, `st_distance_ab_multiple`, `st_intersects_ab`, `st_intersects_count`.

## Front-end tests for the MAPP library

The front-end suite has migrated from Codi to Vitest. It runs headlessly in CI as part of `pnpm test`, and no longer needs a running instance or a browser you drive by hand.

The suites live in the `@geolytix/mapp` package, next to the library they cover, and are configured by `apps/mapp/vitest.config.mjs`.

`apps/mapp/lib/**` is harder to test than `apps/xyz/mod/**` for three reasons, and the setup exists to deal with them:

1. **Global coupling.** 151 of the 184 modules reach their dependencies through the `mapp` global rather than importing them. A test cannot import a module in isolation and expect it to work -- the namespace has to exist first.
2. **OpenLayers.** 30 modules touch the `ol` global, which needs a real canvas to do anything meaningful.
3. **CDN imports at runtime.** `mapp.utils.esmImport()` and `mapp.utils.scriptElement()` both reach the network when called.

### The projects

`pnpm test` runs `turbo run test`, which covers every package. The MAPP library contributes two Vitest projects, the XYZ app one.

| Package | Project | Environment | Tests |
|---|---|---|---|
| `@geolytix/xyz-app` | — | node | `apps/xyz/tests/mod/**` -- the XYZ API |
| `@geolytix/mapp` | `lib` | happy-dom | `apps/mapp/tests/lib/**` -- values and logic |
| `@geolytix/mapp` | `browser` | Chromium via Playwright | `apps/mapp/tests/browser/**` -- anything that renders |

Run one package or one project:

```bash
pnpm test                                        # everything, through turbo
pnpm --filter=@geolytix/mapp test                # both front-end projects
pnpm --filter=@geolytix/mapp test:lib            # the fast inner loop
pnpm --filter=@geolytix/mapp test:browser        # Chromium only
pnpm --filter=@geolytix/mapp test:watch          # watch the lib project
```

`test:lib` finishes in about a second and is what to run while writing front-end code.

### Which project does a test belong in?

Start in `lib`. Move to `browser` only when the assertion genuinely needs a rendering engine.

Use `browser` for:

- **Anything built with `mapp.utils.html`.** This is not a preference, it is a hard constraint -- see below.
- Anything asserting on real geometry, projection, hit detection or map size.
- `lib/mapview/**`, the OpenLayers feature formats, and the style parsers.

Use `lib` for everything else: `lib/utils`, `lib/dictionary.mjs`, `lib/hooks.mjs`, `lib/location`, and the parts of `lib/layer` that decorate and parse rather than render.

> [!IMPORTANT]
> **uhtml templates do not work outside a real browser.**
>
> `lib/utils/uhtml.mjs` marks its interpolation points with an attribute named `isµ0`. Neither happy-dom nor jsdom keeps an attribute whose name contains a non-ASCII character, so the placeholder is dropped, uhtml cannot find it, and the template throws `bad template`.
>
> Node interpolations such as ``html`<div>${value}</div>` `` are fine. Attribute interpolations such as ``html`<div style=${css}>` `` are not. Since almost every UI element uses attribute interpolation somewhere, **`lib/ui/**` tests belong in the `browser` project.**
>
> If you see `Unknown Error: bad template:` in a `lib` project test, this is why. Move the file to `apps/mapp/tests/browser/`.

### The mapp global harness

`apps/mapp/tests/lib/setup.mjs` builds the `mapp` namespace the same way the browser does, by importing `lib/mapp.mjs` and `lib/ui.mjs` for their side effects. Tests then call through the global exactly as the application does. There is nothing to import.

```javascript
import { describe, expect, it } from 'vitest';

describe('utils/paramString', () => {
  it('returns an empty string without params', () => {
    expect(mapp.utils.paramString(null)).toEqual('');
  });
});
```

`apps/mapp/tests/browser/setup.mjs` does the same, but loads the real OpenLayers from the pinned `ol` devDependency first.

#### Stubbing

Because the namespace is a plain mutable object, a dependency is replaced by assignment rather than by module factory mocking.

```javascript
const xhr = vi.spyOn(mapp.utils, 'xhr').mockResolvedValue({ features: [] });

mapp.utils.gazetteer.datasets('term', gazetteer);

expect(xhr).toHaveBeenCalledTimes(2);
```

`vi.mock()` is still the right tool for the 19 modules that import a sibling directly.

The setup file replaces `mapp.utils.esmImport` and `mapp.utils.scriptElement` with functions that throw. **No test may reach the network.** If a module under test needs one of them, stub it for that test.

#### OpenLayers in the lib project

`apps/mapp/tests/lib/stubs/ol.mjs` provides an inert nested Proxy that satisfies the version check in `lib/mapp.mjs` and stops module level `ol` access from throwing. It implements no behaviour. A test whose assertion depends on real OpenLayers will fail on the assertion -- that is the signal to move it to the `browser` project.

#### Reading files from the lib project

happy-dom replaces the global `URL` with an implementation that ignores a `file:` base, so `new URL('../thing', import.meta.url)` resolves against the document rather than the module and yields an `http:` URL. Use `import.meta.dirname` with `node:path` instead.

```javascript
import { join } from 'node:path';

const source = readFileSync(join(import.meta.dirname, '../../lib/mapp.mjs'), 'utf8');
```

#### Fixtures shared with the server tests

The workspace, layer, infoj and dataview definitions under `apps/xyz/tests/assets/` are the contract between the server and the client, so front-end tests import them across the package boundary rather than keeping a second copy. The `browser` project allows the path through `server.fs.allow` in `apps/mapp/vitest.config.mjs`.

### Writing a browser test

The `browser` project runs in real Chromium, so the DOM is real and elements can be clicked.

```javascript
import { describe, expect, it } from 'vitest';

describe('ui/elements/dropdown', () => {
  it('calls back with the entry on change', () => {
    const calls = [];

    const node = mapp.ui.elements.dropdown({
      callback: (event, entry) => calls.push(entry),
      entries: entries(),
    });

    const select = node.querySelector('select');

    select.selectedIndex = 2;
    select.dispatchEvent(new Event('change'));

    expect(calls[0].option).toEqual('ting_2');
  });
});
```

#### The mapview fixture

`apps/mapp/tests/browser/fixtures/mapview.mjs` creates a real decorated mapview backed by a real `ol.Map`.

```javascript
import { createMapview, renderComplete } from './fixtures/mapview.mjs';

mapview = await createMapview();

await renderComplete(mapview);

expect(mapview.Map.getSize()).toEqual([800, 600]);
```

Two things to know:

- **Always await it.** `mapp.Mapview()` returns the object synchronously in the common case, but returns a promise when the locale declares `syncPlugins` or `svgTemplates`.
- **The target needs a non-zero size.** An OpenLayers Map in a zero height container never renders a frame, so anything waiting on `rendercomplete` would hang. The fixture sets 800x600.

Call `mapview.remove()` in an `afterEach`.

#### Running the browser project locally

The browser project needs Chromium, which is a one-off download:

```bash
pnpm exec playwright install chromium
```

CI caches it on the resolved Playwright version.

### Integrity tests

`apps/mapp/tests/integrity/**` is the one suite still on [Codi](https://www.npmjs.com/package/codi-test-framework), and deliberately so. It asserts that a **deployed instance** is correctly configured -- that its workspace resolves, its layers have reachable sources, and its database connections answer. That is a property of a running deployment and its Postgres, not of the source, so a unit runner in CI cannot make the assertion.

Codi is loaded at runtime via ESM by the test plugin, `apps/mapp/lib/plugins/test.mjs`. It is not a package.json dependency.

The suite is the `integrity` entry of the MAPP Vite build, which emits `public/js/lib/integrity.js`. The test plugin imports that bundle when the `test` url param is present:

```
/?test=integrity
```

Configure the test object on the locale to control the output:

```json
"test": {
  "quiet": true,
  "showSummary": true
},
```

The `?test=core` param is gone. Those tests are now `pnpm test`.

For an unminified build with source maps, so the suite can be stepped through in DevTools:

```bash
NODE_ENV=DEVELOPMENT pnpm build --filter=@geolytix/mapp
```

### Coverage

```bash
pnpm --filter=@geolytix/mapp test:coverage
```

writes `apps/mapp/coverage/lcov.info` covering `apps/mapp/lib/**`, alongside the `apps/xyz/coverage/lcov.info` produced by `pnpm test:xyz:coverage`. Both are listed in `sonar-project.properties`.

Measuring `lib/**` for the first time moves the reported total a long way, because 184 previously unmeasured modules enter the denominator. The code did not get worse; the measurement got honest.

`lib/utils/uhtml.mjs` is excluded -- it is a vendored, minified third party bundle.
