/**
 * ## queryTest()
 * @module lib/layer/featureStyle
 */

/**
 * This function is used to test the query API endpoint
 * @function featureStyleTest
 * @param {Object} mapview 
*/
export async function featureStyleTest(mapview) {
    await codi.describe('TODO: Layer: featureStyleTest', async () => {

        /**
         * ### The max value should be set after we update a location.
         * 1. Reset the datasets's icon_scaling field to null
         * 2. Get the layer from the mapview
         * 3. Get an id to perform a select on.
         * 4. Get the location.
         * 5. Set the newValue of the icon_scale field 
         * 6. Update the location.
         * 7. Assert that we have a new max value
         * 8. Reset the icon_scale field to null
         * @function it
        */
        await codi.it('featureStyle: Icon Scaling', async () => {
            //Setting the dataset's icon_scaling value to null
            await mapp.utils.xhr(`/test/api/query?template=icon_scaling_scratch&value=null`);
            //Getting the layer from the mapview
            const layer = mapview.layers['icon_scaling'];
            //Get a location id to perform a get with
            const lastLocation = await mapp.utils.xhr(`${mapp.host}/api/query?template=get_last_location&locale=locale&layer=icon_scaling`);

            //Get location
            const location = await mapp.location.get({
                layer: layer,
                id: lastLocation.id,
            });

            //Set the icon_scale newValue to 300
            location.infoj = location.infoj.map(entry => {
                if (entry.field === 'icon_scale') {
                    entry.newValue = 300;
                }
                return entry;
            });

            //Update the location (This should retrigger the process)
            await location.update();

            //Check that the layers icon_scale.max is no longer 0 but 300
            codi.assertEqual(layer.style.icon_scaling.max, 300, 'After updating a location the max value should be 300');

            //Reset everything to null after the test is done
            await mapp.utils.xhr(`/test/api/query?template=icon_scaling_scratch&value=null`);
        });
    });
}