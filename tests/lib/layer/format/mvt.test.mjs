export function mvtTest() {
    codi.describe('Layer Format: MVT', () => {
        const mvt_layer = {
            'group': 'layer',
            'name': 'mvt_test',
            'format': 'mvt',
            'table': 'test.mvt_test',
            'geom': 'geom_3857',
            'srid': '3857',
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
                    'strokeWidth': '0',
                    'fillColor': '#fff',
                    'fillOpacity': 0.4,
                    'strokeColor': null
                },
                'themes': {
                    'theme_1': {
                        'title': 'theme_1',
                        'type': 'categorized',
                        'field': 'numeric_field',
                        'cat': {
                            '1': {
                                'label': 'Lowest',
                                'style': {
                                    'fillColor': '#3193ED'
                                }
                            },
                            '2': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#5DC29A'
                                }
                            },
                            '3': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#8FE15A'
                                }
                            },
                            '4': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#D8D758'
                                }
                            },
                            '5': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#FFB956'
                                }
                            },
                            '6': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#FE8355'
                                }
                            },
                            '7': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#FA5652'
                                }
                            },
                            '8': {
                                'label': 'Highest',
                                'style': {
                                    'fillColor': '#F0304D'
                                }
                            }
                        }
                    },
                    'theme_2': {
                        'title': 'theme_2',
                        'type': 'categorized',
                        'field': 'numeric_field',
                        'cat': {
                            '1': {
                                'label': 'Lowest',
                                'style': {
                                    'fillColor': '#6B2E94'
                                }
                            },
                            '2': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#8B44B8'
                                }
                            },
                            '3': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#9B6FCD'
                                }
                            },
                            '4': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#89A7D6'
                                }
                            },
                            '5': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#70C1C9'
                                }
                            },
                            '6': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#52C4A3'
                                }
                            },
                            '7': {
                                'label': '-',
                                'style': {
                                    'fillColor': '#38B77C'
                                }
                            },
                            '8': {
                                'label': 'Highest',
                                'style': {
                                    'fillColor': '#1FA855'
                                }
                            }
                        }
                    }
                }
            }

        }

        /**
         * @description MVT: Create basic layer
         * @function it
         */
        codi.it('MVT: Create basic layer', () => {
            mapp.layer.formats[mvt_layer.format]?.(mvt_layer);

            codi.assertTrue(Object.hasOwn(mvt_layer, 'reload'), 'The mvt layer needs to have a reload function')
            codi.assertTrue(Object.hasOwn(mvt_layer, 'featureSource'), 'The mvt layer needs to have a featureSource')
            codi.assertTrue(Object.hasOwn(mvt_layer, 'source'), 'The mvt layer needs to have a source')
            codi.assertTrue(Object.hasOwn(mvt_layer, 'L'), 'The mvt layer needs to have an openlayer object')
        });

        /**
         * @description MVT: Reload should remove sourceTiles
         * @function it
         */
        codi.it('MVT: Reload should remove sourceTiles', () => {
            mapp.layer.formats[mvt_layer.format]?.(mvt_layer);

            mvt_layer.source.sourceTiles_ = { tile: 'foo' };
            mvt_layer.reload();
            codi.assertEqual(mvt_layer.source.sourceTiles_, {}, 'The sourceTiles needs to be cleared');
        });
    });
}