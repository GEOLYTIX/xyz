import { it, describe, assertEqual, assertTrue, assertFalse } from 'https://esm.sh/codi-test-framework@0.0.30';
import { setView } from '../../utils/view.js';

export async function decorateTest(mapview) {
    await describe('Layer: decorateTest', async () => {
        const decorated_layer = mapview.layers['decorate'];
        const workspace = await mapp.utils.xhr(`/test/tests/workspace.json`);
        const decorate_layer = workspace.locale.layers['decorate'];
        decorate_layer.mapview = mapview;
        const layer = await mapp.layer.decorate(decorate_layer);

        await it('Should have a draw object', async () => {
            assertTrue(!!layer.draw, 'The layer should have a draw object by default')
        });

        await it('Should have a show function', async () => {
            assertTrue(!!layer.show, 'The layer should have a show method by default');

            decorated_layer.show();
            assertTrue(decorated_layer.display, 'The layer should display as true');
        });

        await it('Should have a hide function', async () => {
            assertTrue(!!layer.hide, 'The layer should have a hide method by default')

            decorated_layer.hide();
            assertFalse(decorated_layer.display, 'The layer should display as false');
        });

        await it('Should not have an edit object', async () => {
            assertTrue(!layer.edit, 'The layer should not have an edit object as its been deprecated.')
        });

        await it('Should add the skipEntry flag to the textArea entry', async () => {
            layer.infoj.filter(entry => entry.field === 'textarea').forEach(entry => {
                assertTrue(entry.skipEntry, 'The layer should have a hide method by default')
            });
        });

        setView(mapview, 11, 'london');

        await it('Should get test.public tabel at zoom level 11', async () => {
            const table = decorated_layer.tableCurrent();
            assertEqual(table, 'test.scratch')
        });

        await it('Should get geom_3857 geom at zoom level 11', async () => {
            const geom = decorated_layer.geomCurrent();
            assertEqual(geom, 'geom_3857', 'The Geometry at zoom level 11 should be geom_3857')
        });

        await it('Should be able to zoomToExtent', async () => {
            const success = await decorated_layer.zoomToExtent();
            assertTrue(success)
        });
    });
}