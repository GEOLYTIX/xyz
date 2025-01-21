/**
 * @module utils/dateTime
 */

/**
 * This function is used as an entry point for the dateTime Test
 * @function dateTime
 */
export function temporal() {
  codi.describe('Utils: dateTime Test', () => {
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
    codi.it('Should format en-GB locale Date/Time', () => {
      const expectedDate = '13 December 2023 at 18:00';
      const date = mapp.utils.temporal.dateString(params);

      codi.assertEqual(
        date,
        expectedDate,
        'We expect the date to be the exact string',
      );
    });

    /**
     * ### Should convert date string to Unix timestamp
     * @function it
     */
    codi.it('Should convert date string to Unix timestamp', () => {
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
    });

    /**
     * ### Should throw an error for invalid date strings
     * @function it
     */
    codi.it('Should throw an error for invalid date strings', () => {
      const errors = [];

      const invalidDates = [
        'not a date',
        '2024-13-01', // invalid month
        '2024-01-32', // invalid day
        '01/32/2024', // invalid day US format
        'February 30, 2024', // invalid day for February
        '2024/13/01', // invalid month
        {}, // object
        [], // array
        null, // null
        undefined, // undefined
        '', // empty string
        '   ', // whitespace
        '2024-01-01Z', // malformed ISO
        'Tomorrow', // relative dates not supported
      ];

      invalidDates.forEach((invalidDate) => {
        try {
          mapp.utils.temporal.dateToUnixEpoch(invalidDate),
            'Invalid date string provided';
        } catch (error) {
          errors.push(error.message);
        }
      });

      codi.assertTrue(
        errors.length === 9,
        'We expect to have 9 errors logged back',
      );
    });

    /**
     * ### Should format unix timestamps to date time
     * @function it
     */
    codi.it('Should format unix timestamps to date time', () => {
      const epoch = 1704067200;
      const datetime = mapp.utils.temporal.datetime({ value: epoch });

      codi.assertEqual(
        datetime,
        '2024-01-01T00:00:00',
        'The datetime should b be the 1st of January 2024',
      );
    });

    /**
     * ### Should format unix timestamps to date
     * @function it
     */
    codi.it('Should format unix timestamps to date', () => {
      const epoch = 1704067200;
      const datetime = mapp.utils.temporal.date({ value: epoch });

      codi.assertEqual(
        datetime,
        '2024-01-01',
        'The datetime should b be the 1st of January 2024',
      );
    });
  });
}
