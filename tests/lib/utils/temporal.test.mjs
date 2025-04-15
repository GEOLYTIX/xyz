/**
 * @module utils/dateTime
 */

/**
 * This function is used as an entry point for the dateTime Test
 * @function dateTime
 */
export function temporal() {
  codi.describe(
    { name: 'Utils: dateTime Test', id: 'utils_datetime', parentId: 'utils' },
    () => {
      const params = {
        value: 1702483200, // December 13, 2023
        locale: 'en-GB',
        options: {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        },
      };

      /**
       * ### Should format en-GB locale Date/Time
       * @function it
       */
      codi.it(
        {
          name: 'Should format en-GB locale Date/Time',
          parentId: 'utils_datetime',
        },
        () => {
          const expectedDate = '13 December 2023 at 18:00';
          const date = mapp.utils.temporal.dateString(params);

          codi.assertEqual(
            date,
            expectedDate,
            'We expect the date to be the exact string',
          );
        },
      );

      /**
       * ### Should convert date string to Unix timestamp
       * @function it
       */
      codi.it(
        {
          name: 'Should convert date string to Unix timestamp',
          parentId: 'utils_datetime',
        },
        () => {
          const testCases = [
            { input: '2024-01-01 GMT', expected: 1704067200 }, // ISO date
            { input: '01/01/2024 GMT', expected: 1704067200 }, // MM/DD/YYYY
            { input: 'January 1, 2024 GMT', expected: 1704067200 }, // Month DD, YYYY
            { input: '2024.01.01 GMT', expected: 1704067200 }, // YYYY.MM.DD
            { input: '1 Jan 2024 GMT', expected: 1704067200 }, // D MMM YYYY
          ];

          testCases.forEach(({ input, expected }) => {
            const epoch = mapp.utils.temporal.dateToUnixEpoch(input);
            codi.assertEqual(epoch, expected);
          });
        },
      );

      /**
       * ### Should log an error for invalid date strings
       * @function it
       */
      codi.it(
        {
          name: 'Should log an error for invalid date strings',
          parentId: 'utils_datetime',
        },
        () => {
          const errors = [];
          // Save the original console.error
          const originalConsoleError = console.error;

          // Replace console.error with our mock function
          console.error = (message) => {
            errors.push(message);
          };

          const invalidDates = [
            'not a date',
            '2024-13-01', // invalid month
            '2024-01-32', // invalid day
            '01/32/2024', // invalid day US format
            '2024/13/01', // invalid month
            {}, // object
            [], // array
            '   ', // whitespace
            'Tomorrow', // relative dates not supported
          ];

          // Call the function for each invalid date
          invalidDates.forEach((invalidDate) => {
            mapp.utils.temporal.dateToUnixEpoch(invalidDate);
          });

          // Restore the original console.error
          console.error = originalConsoleError;

          // Check if we got the expected number of error messages
          codi.assertTrue(
            errors.length === invalidDates.length,
            `Expected ${invalidDates.length} errors, but got ${errors.length}`,
          );

          // Verify that all errors contain the expected message
          codi.assertTrue(
            errors.every((msg) => msg === 'Invalid date string provided'),
            'All errors should indicate invalid date strings',
          );
        },
      );

      /**
       * ### Should format unix timestamps to date time
       * @function it
       */
      codi.it(
        {
          name: 'Should format unix timestamps to date time',
          parentId: 'utils_datetime',
        },
        () => {
          const epoch = 1704067200;
          const datetime = mapp.utils.temporal.datetime(epoch);

          codi.assertEqual(
            datetime,
            '2024-01-01T00:00:00',
            'The datetime should be the 1st of January 2024',
          );
        },
      );

      /**
       * ### Should format unix timestamps to date
       * @function it
       */
      codi.it(
        {
          name: 'Should format unix timestamps to date',
          parentId: 'utils_datetime',
        },
        () => {
          const epoch = 1704067200;
          const datetime = mapp.utils.temporal.date(epoch);

          codi.assertEqual(
            datetime,
            '2024-01-01',
            'The datetime should be the 1st of January 2024',
          );
        },
      );
    },
  );
}
