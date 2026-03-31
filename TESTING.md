# Testing

XYZ/MAPP testing is split into 3 sections:

- CLI [Command Line Interface] tests for endpoints of the XYZ API.
- Browser based testing of modules bundled into the Mapp library.
- Integrity tests for workspaces and XYZ process environments.

## CLI [Command Line Interface] tests

Command Line Interface tests are typically executed on localhost for a clone of the XYZ repository to check whether XYZ API modules under development execute as outlined in their documentation. These tests should also be run as an action on any pull request to ensure the structural integrity of XYZ API endpoints.

CLI tests use [Vitest](https://vitest.dev/) as the test framework. Vitest must be installed into the node_modules with `pnpm install`.

The CLI tests can be executed with the following bash command.

```bash
pnpm test
```

This runs `vitest run` as defined in the package.json `test` script.

The "test-watch" script watches the test directory and will re-run affected tests on change events.

```bash
pnpm test-watch
```

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
    fileParallelism: false,
  },
});
```

The `tests/setup.mjs` file ensures `globalThis.xyzEnv` exists before any test module loads.

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

## Browser tests for Mapp library modules

Browser tests are designed for the browser environment with full access to:

- DOM
- Mapp library
- Mapview for loaded application
- No mocking required for module imports

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
