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
            codi.assertEqual(location.record.hook, 'location_get_test!7', 'We expect a hook made up of layer key and id');
            codi.assertTrue(location.layer instanceof Object, 'The location needs a layer object');

            // Push removeCallback method to remove callback methods.
            location.removeCallbacks.push(_this => delete _this.removeCallbacks)

            location.remove()

            codi.assertTrue(!location.record.hook, 'The hook should be removed from the location record.');

            codi.assertTrue(!location.removeCallbacks, 'removeCallbacks should have removed themselves.');
        });
    });
}