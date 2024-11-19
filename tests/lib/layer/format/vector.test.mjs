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
         * @function it
         */
        await codi.it('Should create a cluster layer', async () => {

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
            clusterLayer.hide();
        });
    });
}