/**
 * This test is used to test the mapp.location.get function
 * @function getTest 
 * @param {object} mapview 
 */
export async function getTest(mapview) {
    await codi.describe('Location: getTest', async () => {

        /**
         * This tests the functionality to mock a location by passing in a template that returns values from the query
         * @function it
         */
        await codi.it('We should be able to mock a location get.', async () => {
            const locationLayer = mapview.layers['location_get_test'];
            //Get the location with the id returned from the query above
            const location = await mapp.location.get({
                layer: locationLayer,
                getTemplate: 'get_location_mock',
                id: 7,
            });

            codi.assertEqual(location.infoj.length, 3, 'We expect to see three infoj entries');
            codi.assertTrue(!!location.record, 'The location needs a record object');
            codi.assertTrue(!!location.remove, 'The location needs a remove function');
        });
    });
}