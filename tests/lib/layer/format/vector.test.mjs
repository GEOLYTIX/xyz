/**
 * This is the vector module used to test /lib/layer/format/vector
 * @module layer/format/vector
 */

import cluster_layer_default from '../../../assets/layers/cluster/layer.json';

/**
 * This is the entry point function for the vector test module.
 * @function vectorTest 
 * @param {object} mapview 
 */
export async function vectorTest(mapview, layer) {

    layer ??= cluster_layer_default;

    await codi.describe('Layer Format: Vector', async () => {

        /**
         * ### Should be able to create a cluster layer
         * 1. It takes layer params.
         * 2. Decorates the layer.
         * 3. We then give the vector function the layer.
         * 4. We expect the format of the layer to change to 'cluster'
         * 5. We expect the featureFormat of the layer to be 'wkt'
         * @function it
         */
        codi.it('Should create a cluster layer with a wkt featureFormat', async () => {
            const layer_params = {
                mapview: mapview,
                ...layer
            }

            //Decorating layer
            const clusterLayer = await mapp.layer.decorate(layer_params);

            //Passing the layer to the format method
            mapp.layer.formats.vector(clusterLayer);

            //Showing the layer
            clusterLayer.show();
            codi.assertTrue(typeof clusterLayer.show === 'function', 'The layer should have a show function');
            codi.assertTrue(typeof clusterLayer.reload === 'function', 'The layer should have a reload function');
            codi.assertTrue(typeof clusterLayer.setSource === 'function', 'The layer should have a setSource function');
            codi.assertTrue(clusterLayer.format === 'cluster', 'The layer should have the format cluster');
            codi.assertTrue(clusterLayer.featureFormat === 'wkt', 'The layer should have the featureFormat set to wkt');
            clusterLayer.hide();
        });

        /**
       * ### Should be able to create a vector layer
       * 1. It takes layer params.
       * 2. Decorates the layer.
       * 3. We then give the vector function the layer.
       * 4. We expect the format of the layer to be 'wkt'
       * 5. We expect the featureFormat of the layer to be 'test_format'
       * @function it
       */
        codi.it('Should create a wkt layer with a custom featureFormat', async () => {
            const layer_params = {
                mapview: mapview,
                ...layer,
                key: 'feature_format_test',
                featureFormat: 'test_format'
            }

            //Decorating layer
            const custom_layer = await mapp.layer.decorate(layer_params);

            //Passing the layer to the format method
            mapp.layer.formats.vector(custom_layer);

            //Showing the layer
            custom_layer.show();
            codi.assertTrue(typeof custom_layer.show === 'function', 'The layer should have a show function');
            codi.assertTrue(typeof custom_layer.reload === 'function', 'The layer should have a reload function');
            codi.assertTrue(typeof custom_layer.setSource === 'function', 'The layer should have a setSource function');
            codi.assertTrue(custom_layer.format === 'wkt', 'The layer should have the format wkt');
            codi.assertTrue(custom_layer.featureFormat === 'test_format', 'The layer should have the featureFormat set to test_format');
            custom_layer.hide();
        });
    });
}
