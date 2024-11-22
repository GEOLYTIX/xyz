
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

        /**
         * ### should not have a zoom button.
         * 1. The Test sets the mapview to London at zoom level 11.
         * 2. Creates the `changeEnd` event and dispatches it.
         * 3. Checks the magnifying glass is not present.
         * @function it
         */
        await codi.it('should not display a zoom button when not provided', async () => {
            await setView(mapview, 11, 'london')
            const layer = mapview.layers['changeEnd'];
            layer.viewConfig = {
                displayToggle: true,
                zoomToExtentBtn: true
            }

            mapp.ui.layers.view(layer)

            codi.assertEqual(layer.view.querySelector('[data-id=zoom-to]'), null, 'No magnifying glass should be present');
            await delayFunction(1000);
        });

        /**
        * ### should not have a display toggle button.
        * 1. The Test sets the mapview to London at zoom level 11.
        * 2. Creates the `changeEnd` event and dispatches it.
        * 3. Checks the display toggle is not present.
        * @function it
        */
        await codi.it('should not display a display Toggle button when not provided', async () => {
            await setView(mapview, 11, 'london')
            const layer = mapview.layers['changeEnd'];
            layer.viewConfig = {}

            mapp.ui.layers.view(layer)

            codi.assertEqual(layer.view.querySelector('[data-id=display-toggle]'), null, 'No display toggled should be present');
            await delayFunction(1000);
        });

         /**
        * ### should have a default panelOrder
        * 1. The Test sets the mapview to London at zoom level 11.
        * 2. Creates the `changeEnd` event and dispatches it.
        * 3. Checks the panelOrder is default if not provided.
        * @function it
        */
         await codi.it('should use the default panelOrder', async () => {
            await setView(mapview, 11, 'london')
            const layer = mapview.layers['changeEnd'];
            layer.viewConfig = {}

            mapp.ui.layers.view(layer)

            codi.assertEqual(layer.viewConfig.panelOrder, ['draw-drawer', 'dataviews-drawer', 'filter-drawer', 'style-drawer', 'meta'], 'The panelOrder should be default');
            await delayFunction(1000);
        });

         /**
        * ### should have the defined panelOrder
        * 1. The Test sets the mapview to London at zoom level 11.
        * 2. Creates the `changeEnd` event and dispatches it.
        * 3. Checks the panelOrder is what's defined.
        * @function it
        */
         await codi.it('should use the default panelOrder', async () => {
            await setView(mapview, 11, 'london')
            const layer = mapview.layers['changeEnd'];
            layer.viewConfig = {
                panelOrder: ['meta','style-drawer','draw-drawer', 'dataviews-drawer', 'filter-drawer']
            }

            mapp.ui.layers.view(layer)

            codi.assertEqual(layer.viewConfig.panelOrder, ['meta','style-drawer','draw-drawer', 'dataviews-drawer', 'filter-drawer'], 'The panelOrder should be what is defined');
            await delayFunction(1000);
        });

    });
}