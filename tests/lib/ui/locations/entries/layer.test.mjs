import { delayFunction } from '../../../../utils/delay.js';

/**
 * @description Test module for the ui/locations/entries/layer module
 * @module lib/ui/locations/entries/layer
 */

/**
 * @description Entry point for the entries layer test module
 * @function layerTest
 */

import { setView } from '../../../../utils/view.js';

export async function layerTest(mapview) {
    await codi.describe('Layer Entry Test', async () => {
        const entry = {
            mapview: mapview,
            zIndex: 99,
            location: {
                hook: 'entry_layer!23',
                removeCallbacks: []
            },
            'key': 'test_mvt_clone',
            'label': 'entry_mvt_clone',
            'type': 'mvt_clone',
            'display': 'true',
            'name': 'mvt clone',
            'layer': 'mvt_test',
            'query': 'mvt_lookup',
            'queryparams': {},
            'template': {
                'key': 'mvt_lookup',
                'template': 'select id, numeric_field from test.mvt_test'
            }

        };

        /**
         * @function it
         * A basic layer should be created from a entry.type = layer
         */
        await codi.it('We should get a basic layer entry', async () => {
            await mapp.ui.locations.entries.layer(entry);
            //Need to delay for async functions 
            await delayFunction(1000);
            codi.assertTrue(Object.keys(mapview.layers[entry.key]).length > 0, 'We should see the unique layer being added to the mapview')
            entry.location.removeCallbacks?.forEach(fn => fn instanceof Function && fn(this));
            //Need to delay for async functions 
            await delayFunction(1000);
            codi.assertTrue(typeof mapview.layers[entry.key] === 'undefined', 'We should see the unique layer being removed from the mapview')
        });

        /**
         * @function it
         * The layer entry should fail, with warning if the layer doesnt exist in the mapview
         */
        await codi.it('Layer entry should fail with warning', async () => {
            entry.layer = 'bogus_layer'
            await mapp.ui.locations.entries.layer(entry);
            //Need to delay for async functions 
            codi.assertTrue(!mapview.layers[entry.key], 'Should warn about an undefined layer')

            entry.layer = 'mvt_test'
        });

        /**
         * @function it
         * The entry.layer should have a layer toggle if tables is defined
         * 
         */
        await codi.it('Layer entry should adhere to zoom restrictions', async () => {

            const newEntry = {
                mapview: mapview,
                zIndex: 99,
                location: {
                    hook: 'entry_layer!23',
                    removeCallbacks: []
                },
                'key': 'test_layer',
                'label': 'entry_layer',
                'type': 'layer',
                'display': 'true',
                'layer': 'mvt_test',
                'query': 'mvt_lookup',
                'template': {
                    'key': 'mvt_lookup',
                    'template': 'select id, numeric_field from test.mvt_test'
                },
                'queryparams': {},
                'tables': {
                    '12': null,
                    '13': 'test.mvt_test'
                }

            };

            //Zoom out
            await setView(mapview, 11, 'london');

            await mapp.ui.locations.entries.layer(newEntry);

            //Need to delay for async functions 
            await delayFunction(1000);

            codi.assertTrue(mapview.layers[newEntry.key].display_toggle.classList.contains('disabled'), 'Toggle should be disabled')

            //Zoom in
            await setView(mapview, 14, 'london');

            codi.assertFalse(!mapview.layers[newEntry.key].display_toggle.classList.contains('disabled'), 'Toggle should be enabled')

        });
    });
}