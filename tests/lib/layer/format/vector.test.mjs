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
            layer.show();
            codi.assertTrue(typeof layer.show === 'function', 'The layer should have a show function');
            codi.assertTrue(typeof layer.reload === 'function', 'The layer should have a reload function');
            codi.assertTrue(typeof layer.setSource === 'function', 'The layer should have a setSource function');
            codi.assertTrue(layer.format === 'cluster', 'The layer should have the format cluster');
            codi.assertTrue(layer.featureFormat === 'wkt', 'The layer should have the featureFormat set to wkt');
            layer.hide();
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
                'key': 'feature_format_test',
                'display': true,
                'group': 'layer',
                'format': 'wkt',
                'featureFormat': 'test_format',
                'dbs': 'NEON',
                'table': 'test.scratch',
                'srid': '3857',
                'geom': 'geom_3857',
                'qID': 'id',
                'infoj': [
                    {
                        'type': 'pin',
                        'label': 'ST_PointOnSurface',
                        'field': 'pin',
                        'fieldfx': 'ARRAY[ST_X(ST_PointOnSurface(geom_3857)),ST_Y(ST_PointOnSurface(geom_3857))]'
                    }
                ],
                'style': {
                    'default': {
                        'icon': {
                            'type': 'dot',
                            'fillColor': '#13336B'
                        }
                    },
                    'highlight': {
                        'scale': 1.3
                    }
                }
            }

            //Decorating layer
            const layer = await mapp.layer.decorate(layer_params);

            //Passing the layer to the format method
            mapp.layer.formats.vector(layer);

            //Showing the layer
            layer.show();
            codi.assertTrue(typeof layer.show === 'function', 'The layer should have a show function');
            codi.assertTrue(typeof layer.reload === 'function', 'The layer should have a reload function');
            codi.assertTrue(typeof layer.setSource === 'function', 'The layer should have a setSource function');
            codi.assertTrue(layer.format === 'wkt', 'The layer should have the format wkt');
            codi.assertTrue(layer.featureFormat === 'test_format', 'The layer should have the featureFormat set to test_format');
            layer.hide();
        });
    });
}
