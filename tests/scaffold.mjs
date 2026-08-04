import { afterAll, beforeAll } from 'vitest';

/**
 * ## Test Scaffold
 *
 * Shared setup helpers for the Vitest test scripts under `tests/mod`.
 *
 * Test scripts should import from this module rather than repeating the same
 * boilerplate in every file.
 *
 * @module tests/scaffold
 */

/**
 * @function mockConsole
 *
 * @description
 * Replaces a console method for the duration of the test file and restores the
 * original in an `afterAll` hook.
 *
 * Messages logged while the mock is in place are pushed to the returned array
 * so that tests can assert on them without polluting the test output.
 *
 * Only the first argument of each call is collected; the XYZ modules log a
 * single message or Error object.
 *
 * ```js
 * import { mockConsole } from '../../scaffold.mjs';
 *
 * const mockErrors = mockConsole('error');
 *
 * it('logs the failure', () => {
 *   expect(mockErrors[0]).toEqual('Failed');
 * });
 * ```
 *
 * The return value can be ignored when the intent is only to suppress output.
 *
 * @param {string} [method='error'] Console method to mock, eg. `error`, `warn`, `log`.
 *
 * @returns {Array} Collection of messages logged while the mock is in place.
 */
export function mockConsole(method = 'error') {
  const messages = [];

  //Assigning the console method to a property to restore the original function with.
  let originalConsole;

  beforeAll(() => {
    originalConsole = console[method];

    //Changing the console method to push to the local collection of messages.
    console[method] = (message) => {
      messages.push(message);
    };
  });

  afterAll(() => {
    console[method] = originalConsole;
  });

  return messages;
}
