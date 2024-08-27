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