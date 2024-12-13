
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
                minute: '2-digit'
            }
        }

        /**
         * ### Should format en-GB locale Date/Time
         * This test is used to check if a epoch value gets formatted to the correct localised UK Date String.
         * @function it
         */
        codi.it('Should format en-GB locale Date/Time', () => {

            const expectedDate = '13 December 2023 at 18:00'
            const date = mapp.utils.temporal.dateString(params);

            codi.assertEqual(date, expectedDate, 'We expect the date to be the exact string')

        });

        codi.it('Should convert date string to Unix timestamp', () => {

            const testCases = [
                { input: '2024-01-01', expected: 1704067200 },           // ISO date
                { input: '01/01/2024', expected: 1704067200 },          // MM/DD/YYYY
                { input: 'January 1, 2024', expected: 1704067200 },     // Month DD, YYYY
                { input: '2024.01.01', expected: 1704067200 },          // YYYY.MM.DD
                { input: '1 Jan 2024', expected: 1704067200 },          // D MMM YYYY
            ];

            testCases.forEach(({ input, expected }) => {

                input = mapp.utils.temporal.dateToUnixEpoch(input);

                codi.assertEqual(input, expected)
            });

        });

    });
}