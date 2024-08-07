# Testing

Testing in xyz is split up into 3 different sections.

1. cli (console)
2. module (browser)
3. integrity

## cli (console)

The cli tests are normal vanilla javascript tests that execute with the nodejs runtime using the [Codi Test framework](https://www.npmjs.com/package/codi-test-framework).
These tests focus on the xyz (mod) directory to test as many things as possible. These tests mostly focus on code that does not require things that would only be found in the browser.

1. Setup
    - Ensure that you have installed the node modules `npm install`
    - Ensure that you have bun.sh installed in your enviroment
    - To run the tests you can execute `npm run test`

2. Output
    - You will find an output of a summary of all the past/failed tests.

## module (browser)

The module tests are designed to make use of the browser environment by having full access to the DOM.  
With these tests will have full access to the mapp library and a mapview for the loaded application. This allows us to not need to mock different module imports. Everything will be part of the build. All these tests also make use of the Codi test framework, and make use of the test runner, that is designed to run specifically in a view.

To run these tests you will need to lauch the application with specific test settings. These will be provided only to GEOLYTIX developers.

Launch the application and navigate to localhost:3000/test?template=test_view and open the console of the window.
You will see the output of the tests running in the console with any passes/failures.

## integrity

The integrity tests are designed to check data integrity on deployed appications.
To run these test naviate to any deployed instance and ensure that you have `?template=test_view&integrity=true` is included in the params of the URL.

This will give you a similar output to the normal test_view.

## Writing tests

When writing tests you will need to make use of different Codi elements to make up your test.

1. The first thing will be the imports for each test.

> [!NOTE]
> cli

```js
import {} from 'codi-test-framework';
```

> [!NOTE]
> module (Browser)

```js
import {} from 'codi';
```

2. Include the describe and it functions. These are used as the building blocks to the tests. The describe block is used to describe the overall function and what the test suite is actually trying to achive. The It block is used to make more granular descriptions of different elements/functions of the code.

In this example we describe what the main output should be. And then we assert the different elements that are part of the module.
Part of this code is the `assertTrue` function that is used to check if a value is true.

```js
import { describe, it, assertTrue } from 'codi';
describe('All languages should have the same base language entries', () => {
...
        Object.keys(mapp.dictionaries).forEach(language => {
            it(`The ${language} dictionary should have all the base keys`, () => {
                Object.keys(base_dictionary).forEach(key => {
                    assertTrue(!!mapp.dictionaries[language][key], `${language} should have ${key}`);
                });
            });
        });
...
    });
```

Assertion Functions 🧪
Codi provides several assertion functions to compare expected and actual values:

- `assertEqual(actual, expected, message)`: Asserts that the actual value is equal to the expected value. ⚖️
- `assertNotEqual(actual, expected, message)`: Asserts that the actual value is not equal to the expected value. 🙅‍♂️
- `assertTrue(actual, message)`: Asserts that the actual value is true. ✅
- `assertFalse(actual, message)`: Asserts that the actual value is false. ❌
- `assertThrows(callback, errorMessage, message)`: Asserts that the provided callback function throws an error with the specified error message. 💥

### cli

The directory that you need to add these cli tests are in the `tests/mod` directory. This directory needs to replicate the same kind of structure as the mod directory. Reason we do this is to ensure that test correlates to the position in the project that they are referencing.

### module

The directory that you need to add these module tests are in the `tests/lib` directory.
