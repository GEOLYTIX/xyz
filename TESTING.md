# Testing

Testing in xyz is split into 3 different sections:

1. cli (console)
2. module (browser)
3. integrity

## Testing Environment Setup

### Prerequisites

The minimum requirements are:

* Node.js (version 18 and above)
* [Bun.sh](https://bun.sh) (version 1.1.0 and above for Codi v0.0.47)
* Node modules installed via `npm install`

## Test Structure

Tests are organized in the `/tests` directory with two main subdirectories:

* `/tests/mod`: CLI tests for the xyz (mod) directory
* `/tests/lib`: Module tests for browser environment

Example structure:

```

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
  feature1: () => import('./feature1.test.mjs')
};
```

## Test Types

### 1. CLI (Console) Tests

CLI tests are vanilla JavaScript tests that execute in the Node.js runtime using the Codi Test framework. These tests focus on the xyz (mod) directory and code that doesn't require browser-specific features.

#### Running CLI Tests

```bash
npm run test
```

With quiet mode (v0.0.47+):

```bash
npm run test -- --quiet
```

### 2. Module (Browser) Tests

Module tests are designed for the browser environment with full access to:

* DOM
* Mapp library
* Mapview for loaded application
* No mocking required for module imports

#### Running Module Tests

1. Launch the application with specific test settings (provided to GEOLYTIX developers)
2. Navigate to `localhost:3000/test?template=test_view`, just the base /test url if using settings
3. Open browser console to view test results, can also be viewed in vscode with the chrome debugger. (See developer notes)

### 3. Integrity Tests

Integrity tests check data integrity on deployed applications.

#### Running Integrity Tests

1. Navigate to any deployed instance
2. Add `?template=test_view&integrity=true` to the URL parameters
3. View results in browser console

## Writing Tests

### Test Structure

Tests use the describe-it pattern for organization:

```javascript
import { describe, it, assertTrue } from 'codi';

describe('Feature Description', () => {
  it('should behave in a specific way', () => {
    // Test code
  });
});
```

Example with multiple assertions:

```javascript
describe('All languages should have the same base language entries', () => {
  Object.keys(mapp.dictionaries).forEach(language => {
    it(`The ${language} dictionary should have all the base keys`, () => {
      Object.keys(base_dictionary).forEach(key => {
        assertTrue(!!mapp.dictionaries[language][key], 
          `${language} should have ${key}`);
      });
    });
  });
});
```

### Available Assertions

Codi provides several built-in assertions:

* `assertEqual(actual, expected, message)` ⚖️
  * Asserts that the actual value equals the expected value
* `assertNotEqual(actual, expected, message)` 🙅‍♂️
  * Asserts that the actual value does not equal the expected value
* `assertTrue(actual, message)` ✅
  * Asserts that the actual value is true
* `assertFalse(actual, message)` ❌
  * Asserts that the actual value is false
* `assertThrows(callback, errorMessage, message)` 💥
  * Asserts that the callback throws an error with the specified message
* `assertNoDuplicates(callback, errorMessage, message)` 👬
  * Asserts that there are no duplicates in a provided array.

### Test Output Control

Codi v0.0.47 features:

* `--quiet`: Shows only test failures (recommended for CI/CD pipelines)
* Default mode: Shows all test results with colorful output

## Best Practices

1. Maintain parallel structure between source and test directories
2. Use descriptive test names
3. One describe per test suite
4. Group related tests in the same describe block
5. Use test bundles for reusable configurations
6. Keep tests focused and isolated
7. Use `--quiet` flag in CI/CD pipelines. (can also be used on other test fuctions).

## Common Issues and Solutions

### Test Discovery

Codi automatically discovers tests in files with the pattern:

* `*.test.mjs`

### Error Handling

If tests fail to run:

1. Ensure Bun.sh version is compatible (v1.1.0+ for Codi v0.0.47)
2. Check file extensions are `.mjs`
3. Verify import/export syntax is ESM compatible
4. Confirm test directory structure matches source directories
5. Verify test settings in xyz_settings/tests/launch.json

For more information, please visit the [Codi GitHub repository](https://github.com/RobAndrewHurst/codi).
