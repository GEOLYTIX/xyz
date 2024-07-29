import { it, describe, assertFalse, assertTrue } from 'https://esm.sh/codi-test-framework@0.0.29';
export async function changeEndTest(mapview) {

    function delayFunction(delay) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }

    await describe('Layer: changeEndTest', async () => {
        await it('After dispatching the event the layer should not display.', async () => {
            const layer = mapview.layers['changeEnd'];
            const changeEndEvent = new Event('changeEnd');
            const target = layer.mapview.Map.getTargetElement();

            target.dispatchEvent(changeEndEvent);

            await assertFalse(layer.display, 'The changeEnd() layer should not display at the default zoom level.')

            await delayFunction(1000);
        });

        await it('The layer should display at zoom level 6', () => {
            mapview.Map.getView().setZoom(6);
            const layer = mapview.layers['changeEnd'];
            const changeEndEvent = new Event('changeEnd');
            const target = layer.mapview.Map.getTargetElement();

            target.dispatchEvent(changeEndEvent);
            assertTrue(layer.display, 'The changeEnd() layer should display at zoom level 6')
        });
    });
}