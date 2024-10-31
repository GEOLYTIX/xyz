/**
 * ## layer.decorateTest()
 * @module layer/decorateTest
 */
import { setView } from '../../utils/view.js';

/**
 * This function is used as an entry point for the decorateTest
 * - The main function of the test is to see how a layer is decorated from the raw .json of a workspace. 
 * - The test setups with the following
 * 1. The layer gets the decorated_layer from the mapview.
 * 2. Then we get the workspace json from the test directory. 
 * 3. We then assign a mapview to the layer.
 * 4. Then we perform the decorate on the layer.
 * @function decorateTest 
 * @param {Object} mapview 
*/
export async function decorateTest(mapview) {

    setView(mapview, 2, 'default');

    await codi.describe('Layer: decorateTest', async () => {
        const decorated_layer = mapview.layers['decorate'];
        const workspace_layer = await mapp.utils.xhr(`/test/api/workspace/layer?layer=decorate`);
        workspace_layer.mapview = mapview;
        const layer = await mapp.layer.decorate(workspace_layer);

        /**
         * ### Should have a draw object
         * We check if the layer has a draw object
         * @function it
         */
        await codi.it('Should have a draw object', async () => {
            codi.assertTrue(!!layer.draw, 'The layer should have a draw object by default')
        });

        /**
         * ### Should have a show function
         * 1. We check if a decorated layer has a show function
         * 2. We then execute the show() function on a layer.
         * 3. We expect the layer.display to now be true
         * @function it
         */
        await codi.it('Should have a show function', async () => {
            codi.assertTrue(!!layer.show, 'The layer should have a show method by default');

            decorated_layer.show();
            codi.assertTrue(decorated_layer.display, 'The layer should display as true');
        });

        /**
         * ### Should have a hide function
         * 1. We check if the decorated layer has a hide function
         * 2. We execute the hide() function
         * 3. We check if the display is false
         * @function it
         */
        await codi.it('Should have a hide function', async () => {
            codi.assertTrue(!!layer.hide, 'The layer should have a hide method by default')

            decorated_layer.hide();
            codi.assertFalse(decorated_layer.display, 'The layer should display as false');
        });

        /**
         * ### Should not have an edit object
         * - The layer should not have an edit object as it's deprecated.
         * @function it
         */
        await codi.it('Should not have an edit object', async () => {
            codi.assertTrue(!layer.edit, 'The layer should not have an edit object as its been deprecated.')
        });

        /**
         * ### Should add the `skipEntry` flag to the textArea entry
         * - We check if the textArea entry on the decorate layer has the skipEntry flag.
         * @function it
         */
        await codi.it('Should add the skipEntry flag to the textArea entry', async () => {
            layer.infoj.filter(entry => entry.field === 'textarea').forEach(entry => {
                codi.assertTrue(entry.skipEntry, 'The layer should have a hide method by default')
            });
        });

        setView(mapview, 11, 'london');

        /**
         * ### Should get `test.public` table at zoom level 11.
         * 1. We call the `tableCurrent()` function.
         * 2. We assert that the table returned is zool level 11.
         */
        await codi.it('Should get test.public table at zoom level 11', async () => {
            const table = decorated_layer.tableCurrent();
            codi.assertEqual(table, 'test.scratch')
        });

        /**
         * ### Should get `geom_3857` at zoom level 11
         * 1. We call the `geomCurrent()` function.
         * 2. We then assert that the name of the geometry is geom_3857
         * @function it
         */
        await codi.it('Should get geom_3857 geom at zoom level 11', async () => {
            const geom = decorated_layer.geomCurrent();
            codi.assertEqual(geom, 'geom_3857', 'The Geometry at zoom level 11 should be geom_3857')
        });

        /**
         * ### Should be able to zoomToExtent
         * 1. We call the `zoomToExtent()` function.
         * 2. We assert that the return is a success.
         */
        await codi.it('Should be able to zoomToExtent', async () => {
            const success = await decorated_layer.zoomToExtent();
            codi.assertTrue(success)
        });
    });
}