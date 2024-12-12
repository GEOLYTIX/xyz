import mockLayer from '../../assets/layers/location_mock/layer.json';
import mockLayerInfoj from '../../assets/layers/location_mock/infoj.json'
import ukFeatures from '../../assets/data/uk.json';
/**
 * This test is used to test the mapp.location.get function
 * @function get 
 * @param {object} mapview 
 */
export function get(mapview) {
    codi.describe({ name: 'Location: getTest', id: 'location_get' }, async () => {

        const layer_params = {
            key: 'location_mock',
            featureLocation: true,
            ...mockLayer,
            ...mockLayerInfoj
        };

        layer_params.features = ukFeatures.features;

        const layer = await mapview.addLayer(layer_params);

        const location_layer = mapview.layers[layer_params.key];

        // const location_layer_no_infoj = mapview.layers['location_get_test_no_infoj'];

        /**
         * This tests the functionality to mock a location by passing in a template that returns values from the query
         * @function it
         */
        codi.it({ name: 'We should be able to mock a location get.', parentId: 'location_get' }, async () => {

            //Get the location with the id returned from the query above
            const location = await mapp.location.get({
                layer: location_layer,
                getTemplate: 'get_location_mock',
                id: 6,
            });

            codi.assertEqual(location.hook, 'location_mock!6', 'We expect a hook made up of layer key and id');
            codi.assertTrue(location.layer instanceof Object, 'The location needs a layer object');

            // Push removeCallback method to remove callback methods.
            location.removeCallbacks.push(_this => delete _this.removeCallbacks)

            location.remove()

            codi.assertTrue(!location.layer.mapview.locations[location.hook], 'The hook should be removed from the location record.');

            codi.assertTrue(!location.removeCallbacks, 'removeCallbacks should have removed themselves.');
        });

        // /**
        //  * This tests that no location is returned if no infoj is provided
        //  * @function it
        //  */
        // codi.it('Location get should return undefined if location.layer.info is undefined.', async () => {

        //     //Get the location with the id returned from the query above
        //     const location = await mapp.location.get({
        //         layer: location_layer_no_infoj,
        //         getTemplate: 'get_location_mock',
        //         id: 6,
        //     });

        //     codi.assertEqual(location, undefined, 'The Location should be undefined');

        // });

        // /**
        //  * This tests that no location is returned if no infoj is provided
        //  * @function it
        //  */
        // codi.it('The getInfoj method should return an infoj if none is provided on the layer present.', async () => {

        //     //Get the location with the id returned from the query above
        //     const infoj = await mapp.location.getInfoj({
        //         layer: location_layer_no_infoj,
        //         getTemplate: 'get_location_mock',
        //         id: 6,
        //     });

        //     codi.assertTrue(infoj !== undefined, 'The Location should be undefined');
        // });
    });
}