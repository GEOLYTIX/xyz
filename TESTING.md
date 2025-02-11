# Testing

Testing in xyz is split into 3 different sections:

1. cli (console)
2. module (browser)
3. integrity

## Testing Environment Setup

### Prerequisites

The minimum requirements are:

- Node.js (version 18 and above)
- [codi](https://github.com/RobAndrewHurst/codi)
- Node modules installed via `npm install`

## Test Structure

Tests are organized in the `/tests` directory with two main subdirectories:

- `/tests/mod`: CLI tests for the xyz (mod) directory
- `/tests/lib`: Module tests for browser environment

```bash
xyz/
├── mod/
│   ├── module1/
│   │   └── feature1.mjs
├── lib/
│   ├── module2/
│   │   └── feature2.mjs
├── tests/
│   ├── mod/
│   │   ├── module1/
│   │   │   ├── feature1.test.mjs
│   │   │   └── index.mjs
│   └── lib/
│       └── module2/
│           ├── feature2.test.mjs
│           └── index.mjs

```

Each test folder exports an object matching its corresponding directory structure:

```javascript
// tests/mod/module1/index.mjs
export default {
  feature1: () => import('./feature1.test.mjs'),
};
```

## 1. CLI (Console) Tests

CLI tests are javaScript tests that execute in the Node.js runtime using the Codi Test framework. These tests focus on the xyz (mod) directory and code that doesn't require browser-specific features.

The main testing pattern in the cli tests are test mocks.

Codi has implemented some mock modules/functions that are only available in the nodeJS environment.

### Mocks

Module mocking is a strange and weird concept to get your head around. What it is essentially is a way to replace modules or functions with functionality to simulate or 'mock' external entities.

What a mocking module will do is replace the reference of a module in memory with a 'mocked' version of it. This mocked version can then be called on from non-test code and receive typically an output. You can then reset that version of the mocked module to the original export with a reset/restore function.

Codi provides interfaces to mock:

- functions
- modules
- http requests

#### function (fn) mocking

function mocking is quite simple in that it needs to have a context. The context can be the scope of a test, to a module or global.

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

> [!NOTE]
> typically in the tests currently written this methodology isn't used and favoured for the `codi.mock.mockImplementation()` function which can mock a function given to a mocked module. An example of this will be provided in the mock module section.

```javascript
import fs from 'node:fs';

// Mocking fs.readFile() method
codi.mock.method(fs.promises, 'readFile', async () => 'Hello World');

codi.describe({ name: 'Mocking fs.readFile in Node.js', id: 'mock' }, () => {
  codi.it(
    {
      name: 'should successfully read the content of a text file',
      parentId: 'mock',
    },
    async () => {
      codi.assertEqual(fs.promises.readFile.mock.calls.length, 0);
      codi.assertEqual(
        await fs.promises.readFile('text-content.txt'),
        'Hello World',
      );
      codi.assertEqual(fs.promises.readFile.mock.calls.length, 1);

      // Reset the globally tracked mocks.
      mock.reset();
    },
  );
});
```

#### module mocking

You can mock modules with the `codi.mock.module()` function which takes a path and options to mock a module.
The typical practice is that you provide a mocked function that you can implement mocks ontop of making the mocked module more reusable.

> [!NOTE]
> the `codi.mock.module()` function is still in early development as it comes from the node:test runner, which is still in further development

options you can provide mocked module:

- cache: If false, each call to require() or import() generates a new mock module. If true, subsequent calls will return the same module mock, and the mock module is inserted into the CommonJS cache. Default: false.
- defaultExport: An optional value used as the mocked module's default export. If this value is not provided, ESM mocks do not include a default export.
- namedExports: An optional object whose keys and values are used to create the named exports of the mock module.

Bellow is an example of a mocked module referencing a mock function

> [!NOTE]
> Ensure that your module mocks are top level, as to import the module before the dynamic import to the module we are testing.

```javascript
const aclFn = codi.mock.fn();
const mockedacl = codi.mock.module('../../acl.js', {
  cache: false,
  defaultExport: aclFn
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

    const result = await loing();

    //{ email: 'robert.hurst@geolytix.co.uk', admin: true}
    console.log(result);
  });
});
```

#### module & function restore/reset

if you want to return the functionality of a mocked function/module you will want to call the `restore` function on a mocked module.

> ![NOTE]
> You will want to call these restores on mocked modules at the end of a test so that other tests can also mock the same module. If you don't an error will be returned.

```javascript
const aclFn = codi.mock.fn();
const mockedacl = codi.mock.module('../../acl.js', {
  cache: false,
  defaultExport: aclFn
  namedExports:{
    acl: aclFn
  }
});

codi.describe({name: 'mocked module', id: 'mocked_module'}, () => {
  codi.it({'We should be able to mock a module', parentId: 'mocked_module'}, async () => {
  //...test
  });
});

//Call to the mocked module to restore to original state.
mockedacl.restore();
```

#### http mocks

codi has exported functions to help aid in mocking http requests.

`codi.mockHttp` helps create `req` & `res` objects that can be passed to functions in order to simulate a call to the function via an api. You can call the `createRequest` & `createResponse` functions respectively. You can also call the `createMocks` function and perform a destructured assignment on the `req` & `res`.

```javascript
await codi.describe({ name: 'Sign: ', id: 'sign' }, async () => {
  await codi.it({ name: 'Invalid signer', parentId: 'sign' }, async () => {
    const { default: signer } = await import('../../../mod/sign/_sign.js');

    const req = codi.mockHttp.createRequest({
      params: {
        signer: 'foo',
      },
    });

    const res = codi.mockHttp.createResponse();

    //OR

    const { req, res } = codi.mockHttp.createMocks({
      params: {
        signer: 'foo',
      },
    });

    await signer(req, res);

    codi.assertEqual(res.statusCode, 404);
    codi.assertEqual(res._getData(), "Failed to validate 'signer=foo' param.");
  });
});
```

You can also mock the response from the global fetch function by making use of the `MockAgent` & `setGlobalDispatcher` interfaces.

The `MockAgent` class is used to create a mockpool which can intercept different paths to certains URLs. And based on these paths we can specify a return.

The `setGlobalDispatcher` will assign the Agent on a global scope so that calls to the `fetch` function in non-test modules will be intercepted.

Here is an example of this:

```javascript
await codi.describe({ name: 'HTTP Mock', id: 'http_test_fun' }, async () => {
  await codi.it(
    { name: 'We should get some doggies', parentId: 'http_test_fun' },
    async () => {
      const mockAgent = new codi.mockHttp.MockAgent(); //<-- Mockagent we use to get a pool
      codi.mockHttp.setGlobalDispatcher(mockAgent); // <-- Assigning the agent on a global scope.

      const mockPool = mockAgent.get(new RegExp('http://localhost:3000')); //<-- Mock pool listening for the localhost url
      mockPool
        .intercept({ path: '/' })
        .reply(404, [
          'codi',
          'mieka',
          'luci',
        ]); /** <-- When we hit a specific path
                    we get a specified response */

      const response = await fetch('http://localhost:3000');

      codi.assertEqual(response.status, 404, 'We expect to get a 404');
      codi.assertEqual(await response.json(), ['codi', 'mieka', 'luci']);
    },
  );
});
```

### Running CLI Tests

The codi test suit will iterate through the tests directory [ignoring the folders specified in codi.json] and log the results from each test suit.

```bash
node --run test
```

Summary statistics for all tests will be logged with the `-- quiet` flag (codi v.0.47+):

```bash
npm run test -- --quiet
```

## 2. Browser Tests

Browser tests are designed for the browser environment with full access to:

- DOM
- Mapp library
- Mapview for loaded application
- No mocking required for module imports

### Running Browser Tests

A [test application view](https://github.com/GEOLYTIX/xyz/blob/main/public/views/_test.html) is provided in the public folder to execute browser tests.

Mapp module test require ressources which are not publicly accessible. This is to be addressed in a future release.

Please ensure to run the `_build` script prior to launching the test environment.

The current tests require an active user.

The test view will be requested as the default view from the XYZ View API when the local node process is opened on `localhost:3000/test`.

The test results will be logged to the browser dev console.

VSCode can be used to debug tests and mapp library modules as outlined in the [developer notes](https://github.com/GEOLYTIX/xyz/blob/main/DEVELOPING.md).

## 3. Integrity Tests

Integrity tests check data integrity of a workspace through the test view document. The test view hosted in the public directory is set as a view templates in the workspace templates. This can be requested from the View API by setting `test_view` as template URL parameter.

The data integrity tests are currently evaluated for public access.

## Writing Tests

### Test Structure

Tests use the describe-it pattern for organization:

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

## Best Practices

- Maintain parallel structure between source and test directories
- Use descriptive test names
- One describe per test suite
- Group related tests in the same describe block
- Use test bundles for reusable configurations
- Keep tests focused and isolated
- Use `--quiet` flag in CI/CD pipelines. (can also be used on other test fuctions).

## Common Issues and Solutions

### Test Discovery

Codi automatically discovers tests in files with the pattern:

- `*.test.mjs`

### Error Handling

If tests fail to run:

1. Ensure Bun.sh version is compatible (v1.1.0+ for Codi v0.0.47)
2. Check file extensions are `.mjs`
3. Verify import/export syntax is ESM compatible
4. Confirm test directory structure matches source directories
5. Verify test settings in xyz_settings/tests/launch.json

For more information, please visit the [Codi GitHub repository](https://github.com/RobAndrewHurst/codi).

## Browser Tests Development Environment Setup

### Build Configuration

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
   npm run _build
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
