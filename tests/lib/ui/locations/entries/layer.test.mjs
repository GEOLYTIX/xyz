import { delayFunction } from '../../../../utils/delay.js';

/**
 * @description Test module for the ui/locations/entries/layer module
 * @module lib/ui/locations/entries/layer
 */

/**
 * @description Entry point for the entries layer test module
 * @function layerTest
 */
export async function layerTest(mapview) {
    await codi.describe('Layer Entry Test', async () => {
        const entry = {
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
            'layer': 'mvt_test'
        };

        /**
         * @function it
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
    });
}