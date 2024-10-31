/**
 * @module utils/paramString
 */

/**
 * This function is used as an entry point for the paramString Test
 * @function paramStringTest
 */
export async function paramStringTest() {

    await codi.describe('Utils: paramString Test', async () => {

        /**
         * ### Should Return an empty string as nothing is in params
         * This test is used to check that paramString returns an empty string if no params are supplied
         * @function it
         */
        await codi.it('Should return empty param string', async () => {

            const params = null;
            const formattedValue = mapp.utils.paramString(params);
            codi.assertEqual(formattedValue, '', `We expect the value to equal '', we received ${formattedValue}`)
        });

        /**
         * ### Should Return an urlencoded string with the given params
         * This test is used to check that paramString returns a correctly urlencoded string containing the provided params
         * @function it
         */
        await codi.it('Should return urlencoded string', async () => {

            const params = {
                id: 1,
                name: 'test',
                age: '29 ',
                viewport: true,
                template: {'in': {'id':1}}
            }

            const expectedValue = 'id=1&name=test&age=29%20&viewport=true&template=%7B%22in%22%3A%7B%22id%22%3A1%7D%7D'
            const formattedValue = mapp.utils.paramString(params);
            codi.assertEqual(formattedValue, expectedValue, `We expect the value to equal ${expectedValue}, we received ${formattedValue}`)
        });

        /**
         * ### Should Return an urlencoded string with the given params, excluding failing parameters
         * This test is used to check that paramString returns a correctly urlencoded string containing the provided params,
         * without the params that are invalid
         * @function it
         */
        await codi.it('Should return urlencoded string, excluding null and undefined values', async () => {

            const params = {
                id: null,
                name: undefined,
                age: '29 ',
                viewport: [],
                template: {}
            }

            const expectedValue = 'age=29%20'
            const formattedValue = mapp.utils.paramString(params);
            codi.assertEqual(formattedValue, expectedValue, `We expect the value to equal ${expectedValue}, we received ${formattedValue}`)
        });
        
    });
}