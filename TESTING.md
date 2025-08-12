# Testing

XYZ/MAPP testing is split into 3 sections:

- CLI [Command Line Interface] tests for endpoints of the XYZ API.
- Browser based testing of modules bundled into the Mapp library.
- Integrity tests for workspaces and XYZ process environments.

The [codi](https://github.com/RobAndrewHurst/codi) test framework is a required dependency to support the different tests.

## CLI [Command Line Interface] tests

Command Line Interface tests are typically executed on localhost for a clone of the XYZ repository to check whether XYZ API modules under development execute as outlined in their documentation. These tests should also be run as an action on any pull request to ensure the structural integrity of XYZ API endpoints.

The codi test framework must be installed into the node_modules with `pnpm install`.

The codi CLI tests require experimental _module mocks_ which are available in Node 22+ [LTS].

The CLI tests can be executed with the following bash command.

```bash
node --experimental-test-module-mocks node_modules/codi-test-framework/cli.js tests
```

This script is defined as "test" in the package.json document and can also be run with `node --run test`.

> [!NOTE] It is recommended to call the scripts defined in the package.json with node, rather than npm for performance reasons.

The "test-watch" script watches the test directory and will re-run tests on change events. Details of these tests are suppressed with the quiet flag.

```bash
node --run test-watch
```

### Debugging tests

The codi test framework CLI can be launched in debug with VSCode by addign debug config for the node runtime to the launch.json.

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Codi CLI Tests",
  "skipFiles": ["<node_internals>/**"],
  "program": "${workspaceFolder}/node_modules/codi-test-framework/cli.js",
  "args": ["${workspaceFolder}/tests", "--quiet"],
  "runtimeArgs": ["--experimental-test-module-mocks"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen",
  "cwd": "${workspaceFolder}"
}
```

### /tests/mod directory

The `/tests/mod` directory contains tests for the individual XYZ API endpoints and utility modules. The codi test framework CLI will iterate through the test module scripts and execute each. Subfolder with multiple API modules [eg /provider, /sign, /user, /utis, /workspace] include a module of the same name prefixed with an underscore to ensure that this file is listed first in the directory. These entry modules [eg _provider.mjs] import and execute any test modules from the same directory.

### codi test module structure [describe > it > assert]

A codi test module will usually import modules to be tested within an async codi.describe() method which defines the test or a group of tests.

Multiple codi.it() methods can be executed in an async fashion within each codi.describe() method to test individual aspects of a module.

Multiple assertations can be checked with codi.assert\*() methods inside a codi.it() test. Each assertation must be met for the codi.it() test to pass.

For example: The codi test module for the /user/token module must import the token and auth modules in the codi.describe() method. The method then awaits the execution of multiple codi.it() methods to test whether the module correctly responds to mocked HTTP requests with missing or valid parameters. A codi.it() method to check for missign parameter will validate with a codi.assertTrue() method checking for the return of an Error. Multiple codi.it() methods can be chained in an async fashion by storing the variables within the closure of the codi.describe() method. A codi.it() method with a valid request user parameter will store the token returned from the tested module for a subsequent codi.it() method to pass this token to the auth module and check whether the expected user object is returned.

### Mocks

> [!NOTE] Mocking is only available with an expiremental flag in Node 22+ [LTS]

Mocking allows alteration of the default behaviour of functions or methods for testing.

Mocking replaces the reference of a module or function in memory with a 'mocked' version of it. This mocked version can then be called from non-test code and receive an output.

It is important to restore mocked objects within the closure of multiple tests.

#### function (fn) mocking

Just like any function, mocking a function needs to have context. The context can be the scope of a test, imported module or global.

To mock a function you can call the `codi.mock.fn()` function.

This creates a mock function which you can interface with.

```javascript
const random = codi.mock.fn((max) => return Math.floor(Math.random() * max););

codi.it({ name: 'random', parentId: 'foo' }, () => {
  codi.assertTrue(random(1) === 0, 'We expect the number to be 0');
  codi.assertTrue(random(3) <= 2), 'We expect the number to less than or equal to 2';
});
```

You can also mock functions/methods with the `codi.mock.method()` function that will take an object as a reference and implement a mock function to that objects method.

> [!NOTE] typically in tests written this methodology isn't used and favoured for the `codi.mock.mockImplementation()/mockImplementationOnce()` function which can mock a function given to a mocked module. An example of this will be provided in the mock module section.

```javascript
import fs from "node:fs";

// Mocking fs.readFile() method
codi.mock.method(fs.promises, "readFile", async () => "Hello World");

codi.describe({ name: "Mocking fs.readFile in Node.js", id: "mock" }, () => {
  codi.it(
    {
      name: "should successfully read the content of a text file",
      parentId: "mock",
    },
    async () => {
      codi.assertEqual(fs.promises.readFile.mock.calls.length, 0);
      codi.assertEqual(
        await fs.promises.readFile("text-content.txt"),
        "Hello World",
      );
      codi.assertEqual(fs.promises.readFile.mock.calls.length, 1);

      // Reset the globally tracked mocks.
      mock.reset();
    },
  );
});
```

#### module mocking

The `codi.mock.module()` function requires the path of a module to mock as first argument with options for the mocked module as second argument.

Properties for the options argument are:

- cache: If false, each call to require() or import() generates a new mock module. Default: false.
- defaultExport: An optional value used as the mocked module's default export. If this value is not provided, ESM mocks do not include a default export. It possible to provide a mocked function as defaultExport property in the options parameter.
- namedExports: An optional object whose keys and values are used to create the named exports of the mock module.

> [!IMPORTANT] Ensure that functions are mocked prior to a module exporting the function. And modules are mocked prior to imports of modules that require a mocked module.

In the following example the acl method is mocked as export for acl module. The mock implementation of the acl function returns a user object defined in the mock implementation. This allows to return a user object from the acl module without access to a store for user objects.

The imported login module will now return a user object regardless of arguments provided to the login module method.

```javascript
const aclFn = codi.mock.fn();
const mockedacl = codi.mock.module('../../acl.js', {
  cache: false,
  defaultExport: aclFn,
  namedExports:{
    acl: aclFn
  }
});

codi.describe({name: 'mocked module', id: 'mocked_module'}, () => {
  codi.it({'We should be able to mock a module', parentId: 'mocked_module'}, async () => {

    aclFn.mock.mockImplementation(() => {
      const user = {
        email: 'robert.hurst@geolytix.co.uk',
        admin: true
      };
      return user
    })

    const { default: login } = await import('../../../mod/user/login.js');

    //{ email: 'robert.hurst@geolytix.co.uk', admin: true}
    const result = await login();
  });
});

// The mocked ACL module must be restored once the tests are completed.
mockedacl.restore();
```

> [!IMPORTANT] Mocked functions and modules must be restored prior to tests which may require the default behaviour of the same object.

#### http mocks

Node HTTP resquests and responses can be mocked to test endpoints in the middleware.

`codi.mockHttp` helps create `req` & `res` objects that can be passed to functions in order to simulate a call to the function via an api. You can call the `createRequest` & `createResponse` functions respectively. You can also call the `createMocks` function and perform a destructured assignment on the `req` & `res`.

In the following example we mock a HTTP request with a user object param for the /user/token API module. The module will send a signed token as HTTP response from the module. The token can be accessed as [sent] data from the mocked HTTP response object.

```javascript
const { default: userToken } = await import("../../../mod/user/token.js");
await codi.it(
  { name: "10hr admin user token", parentId: "user_token" },
  async () => {
    const { req, res } = codi.mockHttp.createMocks({
      params: {
        expiresin: "10hr",
        user: {
          email: "test@geolytix.co.uk",
        },
      },
    });

    await userToken(req, res);

    const token = res._getData();

    const user = jwt.verify(token, xyzEnv.SECRET, {
      algorithm: xyzEnv.SECRET_ALGORITHM,
    });

    // token expires in 10hr.
    codi.assertTrue(user.exp - user.iat === 36000);

    // user from token must not have admin rights.
    codi.assertTrue(!user.admin);
  },
);
```

You can also mock the response from the global fetch function by making use of the `MockAgent` & `setGlobalDispatcher` interfaces.

The `MockAgent` class is used to create a mockpool which can intercept different paths to certain URLs. And based on these paths we can specify a return.

The `setGlobalDispatcher` will assign the Agent on a global scope so that calls to the `fetch` function in non-test modules will be intercepted.

Here is an example of this:

```javascript
await codi.describe({ name: "HTTP Mock", id: "http_test_fun" }, async () => {
  await codi.it(
    { name: "We should get some doggies", parentId: "http_test_fun" },
    async () => {
      const mockAgent = new codi.mockHttp.MockAgent(); //<-- Mockagent we use to get a pool
      codi.mockHttp.setGlobalDispatcher(mockAgent); // <-- Assigning the agent on a global scope.

      const mockPool = mockAgent.get(new RegExp("http://localhost:3000")); //<-- Mock pool listening for the localhost url
      mockPool
        .intercept({ path: "/" })
        .reply(404, [
          "codi",
          "mieka",
          "luci",
        ]); /** <-- When we hit a specific path
                    we get a specified response */

      const response = await fetch("http://localhost:3000");

      codi.assertEqual(response.status, 404, "We expect to get a 404");
      codi.assertEqual(await response.json(), ["codi", "mieka", "luci"]);
    },
  );
});
```

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
  "options": { <-- Options passed to the runWebTestFunction
    "quiet": true, <-- will only show errors (Defaults to false)
    "showSummary": true, <-- will show a summary (Default to false)
  }
},
```

To run the different tests you can provide the `test` param as part of the url params.

eg.

`/?test=core` - run the core front end tests
`/?test=integrity` - run the integrity tests

- `core` - `mapp` object tests
- `integrity` - workspaces and XYZ process environments tests

### Writing Tests

#### Test Structure

Tests use the describe-it pattern for organization:

```javascript
import { describe, it, assertTrue } from "codi";

describe({ name: "Feature Description", id: "feature_description" }, () => {
  it(
    {
      name: "should behave in a specific way",
      parentId: "feature_description",
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
    name: "All languages should have the same base language entries",
    id: "dictionaries",
  },
  () => {
    Object.keys(mapp.dictionaries).forEach((language) => {
      codi.it(
        {
          name: `The ${language} dictionary should have all the base keys`,
          parentId: "dictionaries",
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

### Available Assertions

Codi provides several built-in assertions:

- `assertEqual(actual, expected, message)` ⚖️
  - Asserts that the actual value equals the expected value
- `assertNotEqual(actual, expected, message)` 🙅‍♂️
  - Asserts that the actual value does not equal the expected value
- `assertTrue(actual, message)` ✅
  - Asserts that the actual value is true
- `assertFalse(actual, message)` ❌
  - Asserts that the actual value is false
- `assertThrows(callback, errorMessage, message)` 💥
  - Asserts that the callback throws an error with the specified message
- `assertNoDuplicates(callback, errorMessage, message)` 👬
  - Asserts that there are no duplicates in a provided array.

### Best Practices

- Maintain parallel structure between source and test directories
- Use descriptive test names
- One describe per test suite
- Group related tests in the same describe block
- Use test bundles for reusable configurations
- Keep tests focused and isolated
- Use `--quiet` flag in CI/CD pipelines. (can also be used on other test fuctions).

### Common Issues and Solutions

#### Test Discovery

Codi automatically discovers tests in files with the pattern:

- `*.test.mjs`

#### Error Handling

If tests fail to run:

1. Ensure Bun.sh version is compatible (v1.1.0+ for Codi v0.0.47)
2. Check file extensions are `.mjs`
3. Verify import/export syntax is ESM compatible
4. Confirm test directory structure matches source directories
5. Verify test settings in xyz_settings/tests/launch.json

For more information, please visit the [Codi GitHub repository](https://github.com/RobAndrewHurst/codi).

### Browser Tests Development Environment Setup

#### Build Configuration

Tests require an unminified build to enable debugging and stepping through code. This is handled by the build system (`esbuild.config.mjs`).

Setting process environment `NODE_ENV=DEVELOPMENT` disables minification in build processes.

```javascript
// esbuild.config.mjs
import * as esbuild from "esbuild";

const isDev = process.env.NODE_ENV !== "DEVELOPMENT";

const buildOptions = {
  entryPoints: isDev
    ? ["./lib/mapp.mjs", "./lib/ui.mjs"]
    : ["./lib/mapp.mjs", "./lib/ui.mjs", "./tests/_mapp.test.mjs"],
  bundle: true,
  minify: isDev, // Code won't be minified in development
  sourcemap: true,
  sourceRoot: "/lib",
  format: "iife",
  outbase: ".",
  outdir: "public/js",
  metafile: true,
  logLevel: "info",
};

try {
  await esbuild.build(buildOptions);
} catch (err) {
  console.error("Build failed:", err);
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
