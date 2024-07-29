import { it, describe, assertFalse, assertTrue } from 'https://esm.sh/codi-test-framework@0.0.29';
import { setView } from '../../utils/view.js';
import { delayFunction } from '../../utils/delay.js';
export async function changeEndTest(mapview) {

    await describe('Layer: changeEndTest', async () => {
        await it('After dispatching the event the layer should not display.', async () => {
            const layer = mapview.layers['changeEnd'];
            const changeEndEvent = new Event('changeEnd');
            const target = layer.mapview.Map.getTargetElement();

            target.dispatchEvent(changeEndEvent);

            await assertFalse(layer.display, 'The changeEnd() layer should not display at the default zoom level.')

            await delayFunction(1000);
        });

        await it('The layer should display at zoom level 6', async () => {
            setView(mapview, 11, 'london')
            const layer = mapview.layers['changeEnd'];
            const changeEndEvent = new Event('changeEnd');
            const target = layer.mapview.Map.getTargetElement();

            target.dispatchEvent(changeEndEvent);
            assertTrue(layer.display, 'The changeEnd() layer should display at zoom level 6');
            await delayFunction(1000);
        });
    });
}