/**
 * This test is used to test the mapp.location.get function
 * @function getTest 
 * @param {object} mapview 
 */
export async function getTest(mapview) {
    await codi.describe('Location: getTest', async () => {

        const location_layer = mapview.layers['location_get_test'];

        const location_layer_no_infoj = mapview.layers['location_get_test_no_infoj'];

        /**
         * This tests the functionality to mock a location by passing in a template that returns values from the query
         * @function it
         */
        await codi.it('We should be able to mock a location get.', async () => {

            //Get the location with the id returned from the query above
            const location = await mapp.location.get({
                layer: location_layer,
                getTemplate: 'get_location_mock',
                id: 6,
            });

            codi.assertEqual(location.infoj.length, 4, 'We expect to see three infoj entries');
            codi.assertEqual(location.record.hook, 'location_get_test!6', 'We expect a hook made up of layer key and id');
            codi.assertTrue(location.layer instanceof Object, 'The location needs a layer object');

            // Push removeCallback method to remove callback methods.
            location.removeCallbacks.push(_this => delete _this.removeCallbacks)

            location.remove()

            codi.assertTrue(!location.record.hook, 'The hook should be removed from the location record.');

            codi.assertTrue(!location.removeCallbacks, 'removeCallbacks should have removed themselves.');
        });

        /**
         * This tests that no location is returned if no infoj is provided
         * @function it
         */
        await codi.it('Location get should return undefined if location.layer.info is undefined.', async () => {

            //Get the location with the id returned from the query above
            const location = await mapp.location.get({
                layer: location_layer_no_infoj,
                getTemplate: 'get_location_mock',
                id: 6,
            });

            codi.assertEqual(location, undefined, 'The Location should be undefined');

        });

        /**
         * This tests that no location is returned if no infoj is provided
         * @function it
         */
        await codi.it('The getInfoj method should return an infoj if none is provided on the layer present.', async () => {

            //Get the location with the id returned from the query above
            const infoj = await mapp.location.getInfoj({
                layer: location_layer_no_infoj,
                getTemplate: 'get_location_mock',
                id: 6,
            });

            codi.assertTrue(infoj !== undefined, 'The Location should be undefined');
        });
    });
}