import { it, describe, assertTrue } from 'https://esm.sh/codi-test-framework@0.0.29';
export async function decorateTest(mapview) {
    await describe('Layer: decorateTest', async () => {
        const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
        const decorate_layer = workspace.locale.layers['decorate'];
        decorate_layer.mapview = mapview;
        const layer = await mapp.layer.decorate(decorate_layer);

        await it('Should have a draw object', async () => {
            assertTrue(!!layer.draw, 'The layer should have a draw object by default')
        });

        await it('Should have a show function', async () => {
            assertTrue(!!layer.show, 'The layer should have a show method by default')
        });

        await it('Should have a hide function', async () => {
            assertTrue(!!layer.hide, 'The layer should have a hide method by default')
        });

        await it('Should not have an edit function', async () => {
            assertTrue(!layer.edit, 'The layer should have a hide method by default')
        });

        await it('Should add the skipEntry flag to the textArea entry', async () => {
            layer.infoj.filter(entry => entry.field === 'textarea').forEach(entry => {
                assertTrue(entry.skipEntry, 'The layer should have a hide method by default')
            });
        });

        mapview.layers['decorate'].show();
    });
}