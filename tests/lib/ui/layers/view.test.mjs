
/**
 * 
 * @module /ui/layers/view
 */

import { setView } from '../../../utils/view.js';
import { delayFunction } from '../../../utils/delay.js';

/**
 * This function is used as an entry point for the changeEndTest
 * @function viewTest 
 * @param {Object} mapview 
*/
export async function viewTest(mapview) {

    await setView(mapview, 2, 'default');

    await codi.describe('UI Layers: viewTest', async () => {

        /**
         * ### should dispatch the event and the layer should not display
         * 1. We create the `changeEnd` event and dispatch it.
         * 2. We assert that the `layer.display` is not set to true.
         * @function it
         */
        await codi.it('should dispatch the event and the layer should not display.', async () => {
            const layer = mapview.layers['changeEnd'];
            const changeEndEvent = new Event('changeEnd');
            const target = layer.mapview.Map.getTargetElement();

            target.dispatchEvent(changeEndEvent);

            await codi.assertFalse(layer.display, 'The changeEnd() layer should not display at the default zoom level.')

            await delayFunction(1000);
        });

        /**
         * ### should display at zoom level 6.
         * 1. The Test sets the mapview to London at zoom level 11.
         * 2. Creates the `changeEnd` event and dispatches it.
         * 3. And asserts that the `layer.display` is true.
         * @function it
         */
        await codi.it('should display at zoom level 6', async () => {
            await setView(mapview, 11, 'london')
            const layer = mapview.layers['changeEnd'];
            const changeEndEvent = new Event('changeEnd');
            const target = layer.mapview.Map.getTargetElement();

            target.dispatchEvent(changeEndEvent);
            codi.assertTrue(layer.display, 'The changeEnd() layer should display at zoom level 6');
            await delayFunction(1000);
        });
    });
}