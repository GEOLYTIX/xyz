/**
 * This is the vector module used to test /lib/layer/format/vector
 * @module layer/format/vector
 */

/**
 * This is the entry point function for the vector test module.
 * @function vectorTest 
 * @param {object} mapview 
 */
export async function vectorTest(mapview) {
    await codi.describe('Layer Format: Vector', () => {

        /**
         * ### Should be able to create a cluster layer
         * 1. It takes layer params.
         * 2. Decorates the layer.
         * 3. We then give the vector function the layer.
         * 4. We expect the format of the layer to change to 'cluster'
         * @function it
         */
        codi.it('Should create a cluster layer', async () => {
            const layer_params = {
                mapview: mapview,
                'key': 'cluster_test',
                'display': true,
                'group': 'layer',
                'format': 'wkt', //This should change to cluster when used in the vector function
                'dbs': 'NEON',
                'table': 'test.scratch',
                'srid': '3857',
                'geom': 'geom_3857',
                'qID': 'id',
                'cluster': {
                    'resolution': 0.005,
                    'hexgrid': true
                },
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
                    'cluster': {
                        'icon': {
                            'type': 'target',
                            'fillColor': '#E6FFFF',
                            'layers': {
                                '1': '#13336B',
                                '0.85': '#E6FFFF'
                            }
                        }
                    },
                    'highlight': {
                        'scale': 1.3
                    },
                    'theme': {
                        'title': 'theme_1',
                        'type': 'graduated',
                        'field': 'test_template_style',
                        'graduated_breaks': 'greater_than',
                        'template': {
                            'key': 'test_template_style',
                            'template': '100-99',
                            'value_only': true
                        },
                        'cat_arr': [
                            {
                                'value': 0,
                                'label': '0 to 5%',
                                'style': {
                                    'icon': {
                                        'fillColor': '#ffffcc',
                                        'fillOpacity': 0.8
                                    }
                                }
                            }
                        ]
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
            codi.assertTrue(layer.format === 'cluster', 'The layer should have the format cluster');
            layer.hide();
        });
    });
}