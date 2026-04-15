# Testing

XYZ/MAPP testing is split into 3 sections:

- CLI [Command Line Interface] tests for endpoints of the XYZ API.
- Browser based testing of modules bundled into the Mapp library.
- Integrity tests for workspaces and XYZ process environments.

## Migrating from Codi to Vitest

The server-side (CLI) test suite has been migrated from the [codi-test-framework](https://www.npmjs.com/package/codi-test-framework) to [Vitest](https://vitest.dev/).

Codi was originally used for both browser and server-side tests. It provided `describe`, `it`, `assertTrue`, `assertEqual`, and similar functions, loaded at runtime via ESM from `https://esm.sh/codi-test-framework`. This worked well in the browser where the full `mapp` global and DOM are available, but was a poor fit for server-side unit testing:

- Tests that called `mapp.utils.xhr(...)` could not run without a live Express server and browser environment.
- There was no mocking system, making it impossible to isolate modules from their dependencies (database connections, file system, external APIs).
- Test discovery was manual — each file had to be explicitly wired up.
- There was no coverage reporting, watch mode, or CI integration out of the box.

Vitest solves all of these problems. It is a Vite-native test framework with built-in mocking (`vi.mock`, `vi.fn`), snapshot testing, code coverage (v8 provider), watch mode, parallel execution, and first-class ESM support — which is important since the XYZ codebase is `"type": "module"` throughout.

> [!NOTE] Browser tests (`tests/lib/` and `tests/browser/`) still use Codi because they run inside the application in a real browser with access to the DOM, OpenLayers map, and the `mapp` global. These are loaded by the [Test Plugin](https://github.com/GEOLYTIX/xyz/blob/main/lib/plugins/test.mjs) and are not part of the Vitest pipeline.

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

This runs `vitest run` as defined in the package.json `test` script.

Watch mode re-runs affected tests on file changes:

```bash
pnpm test-watch
```

Run a single test file:

```bash
pnpm exec vitest run tests/mod/query.test.mjs
```

Run tests matching a name pattern:

```bash
pnpm exec vitest run -t "should return 400"
```

### Coverage

Generate a coverage report with the v8 provider:

```bash
pnpm coverage
```

This runs `vitest run --coverage` and prints a table showing statement, branch, function, and line coverage for every file under `mod/`.

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

- Only `tests/mod/**` and `tests/plugins/**` are included. Browser tests (`tests/lib/**`, `tests/browser/**`) are excluded — they use Codi and run in the browser.
- `tests/setup.mjs` ensures `globalThis.xyzEnv` exists before any test module loads.
- Tests run in parallel across files with a 10-second timeout per test.

### CI Pipeline

Tests run automatically on every push and pull request to `main`, `major`, `minor`, and `patch` branches via the GitHub Actions workflow in `.github/workflows/unit_tests.yml`:

```yaml
- name: Install Dependencies
  run: pnpm install

- name: Run tests
  run: node --run test
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

## Browser tests for Mapp library modules

Browser tests are designed for the browser environment with full access to:

- DOM
- Mapp library
- Mapview for loaded application
- No mocking required for module imports

Browser tests still use [Codi](https://www.npmjs.com/package/codi-test-framework), which is loaded at runtime via ESM in the [Test Plugin](https://github.com/GEOLYTIX/xyz/blob/main/lib/plugins/test.mjs). Codi provides `describe`, `it`, `assertTrue`, `assertEqual`, and related assertion functions designed for in-browser execution.

### Running Browser Tests

A [Test Plugin](https://github.com/GEOLYTIX/xyz/blob/main/lib/plugins/test.mjs) is provided to run tests in the browser.

Please ensure to run the `_build` script prior to launching the local test environment test environment.

The current tests require an active user to execute.

In order for the tests to run you will need to configure the test object on a locale.

```json
"test": {
  "options": {
    "quiet": true,
    "showSummary": true
  }
},
```

To run the different tests you can provide the `test` param as part of the url params.

eg.

`/?test=core` - run the core front end tests
`/?test=integrity` - run the integrity tests

- `core` - `mapp` object tests
- `integrity` - workspaces and XYZ process environments tests

### Writing Browser Tests

#### Test Structure

Browser tests use the describe-it pattern for organization:

```javascript
import { describe, it, assertTrue } from 'codi';

describe({ name: 'Feature Description', id: 'feature_description' }, () => {
  it(
    {
      name: 'should behave in a specific way',
      parentId: 'feature_description',
    },
    () => {
      // Test code
    },
  );
});
```

Example with multiple assertions:

```javascript
codi.describe(
  {
    name: 'All languages should have the same base language entries',
    id: 'dictionaries',
  },
  () => {
    Object.keys(mapp.dictionaries).forEach((language) => {
      codi.it(
        {
          name: `The ${language} dictionary should have all the base keys`,
          parentId: 'dictionaries',
        },
        () => {
          Object.keys(base_dictionary).forEach((key) => {
            codi.assertTrue(
              !!mapp.dictionaries[language][key],
              `${language} should have ${key}`,
            );
          });
        },
      );
    });
  },
);
```

### Browser Tests Development Environment Setup

#### Build Configuration

Tests require an unminified build to enable debugging and stepping through code. This is handled by the build system (`esbuild.config.mjs`).

Setting process environment `NODE_ENV=DEVELOPMENT` disables minification in build processes.

```javascript
// esbuild.config.mjs
import * as esbuild from 'esbuild';

const isDev = process.env.NODE_ENV !== 'DEVELOPMENT';

const buildOptions = {
  entryPoints: isDev
    ? ['./lib/mapp.mjs', './lib/ui.mjs']
    : ['./lib/mapp.mjs', './lib/ui.mjs', './tests/_mapp.test.mjs'],
  bundle: true,
  minify: isDev, // Code won't be minified in development
  sourcemap: true,
  sourceRoot: '/lib',
  format: 'iife',
  outbase: '.',
  outdir: 'public/js',
  metafile: true,
  logLevel: 'info',
};

try {
  await esbuild.build(buildOptions);
} catch (err) {
  console.error('Build failed:', err);
  process.exit(1);
}
```

### Running Tests in Development Mode

1. Set the environment variable:

   ```bash
   NODE_ENV=DEVELOPMENT
   ```

   > This can be defined in your .env or in your nodemon.json config.

2. Build the project:

   ```bash
   pnpm _build
   ```

3. Verify that:
   - Test files are included in the build
   - Source maps are generated
   - Code is not minified

4. Launch the application and navigate to `localhost:3000/test?template=test_view`

5. Open Chrome DevTools to:
   - View test results in the console
   - Debug and step through unminified code
   - Use source maps for accurate file locations

### Debugging Benefits

The unminified development build provides several advantages:

- Clear, readable code in Chrome DevTools
- Accurate source mapping to original files
- Ability to set breakpoints in original source files
- Step-through debugging from Chrome to VSCode
- Easier identification of test failures
