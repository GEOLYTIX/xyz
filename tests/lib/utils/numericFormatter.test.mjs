/**
 * @module utils/numericFormatter
 */

/**
 * This function is used as an entry point for the numericFormatter Test
 * @function numericFormatterTest
 */
export async function numericFormatterTest() {

    await codi.describe('Utils: numericFormatter Test', async () => {
        const params = {
            stringValue: '654321.987',
            prefix: '$',
            formatterParams: {
                locale: 'UK'
            }
        };

        const expected_value = 654321.987
        /**
         * ### Should unformat UK locale string
         * This test is used to check if a localised string to UK returns the correct string.
         * @function it
         */
        await codi.it('Should unformat UK locale strings', async () => {

            const unformattedString = mapp.utils.unformatStringValue(params)
            codi.assertEqual(unformattedString, expected_value, `We expect the value to equal ${expected_value}, we received ${unformattedString}`)
        });
        /**
         * ### Should unformat DE locale string
         * This test is used to check if a localised string to DE returns the correct string.
         * @function it
         */
        await codi.it('Should unformat DE locale strings', async () => {
            //Settings the locale to 'DE'
            params.formatterParams.locale = 'DE'

            const unformattedString = mapp.utils.unformatStringValue(params)
            codi.assertEqual(unformattedString, expected_value, `We expect the value to equal ${expected_value}, we received ${unformattedString}`)
        });

        await codi.it('Should unformat PL locale strings', async () => {
            //Settings the locale to 'PL'
            params.formatterParams.locale = 'PL'

            const unformattedString = mapp.utils.unformatStringValue(params)
            codi.assertEqual(unformattedString, expected_value, `We expect the value to equal ${expected_value}, we received ${unformattedString}`)
        });

        await codi.it('Should unformat RUB locale strings', async () => {
            //Settings the locale to 'RUB'
            params.formatterParams.locale = 'RUB'

            const unformattedString = mapp.utils.unformatStringValue(params)
            codi.assertEqual(unformattedString, expected_value, `We expect the value to equal ${expected_value}, we received ${unformattedString}`)
        });
    });
}