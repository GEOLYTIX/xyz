/**
 * This is the add layer test module for the mapview.
 * @module lib/mapview/addLayer
 */

import { removeLayer } from './removeLayer.test.mjs';
/**
 * The entry point test that is used to test the add layer module for a mapview.
 * @param {Object} mapview
 * @function addLayerTest
 */
export async function addLayer(mapview) {
  await codi.describe(
    { name: 'addLayerTest', id: 'mapview_add_layer', parentId: 'mapview' },
    () => {
      /**
       * This test is used to check if we can add a single layer to the mapview.
       * @function it
       */
      codi.it(
        { name: 'Add single layer to mapview.', parentId: 'mapview_add_layer' },
        async () => {
          const layer = {
            key: 'layer_test_1',
            format: 'tiles',
            URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          };

          const layers = await mapview.addLayer(layer);

          codi.assertEqual(
            layers.length,
            1,
            'We expect to see 1 layer being returned from getLayers method.',
          );
          codi.assertTrue(
            layers[0].show instanceof Function,
            'The decorated layer has a show method.',
          );
          codi.assertTrue(
            Object.hasOwn(mapview.layers, layers[0].key),
            'The layer has been added to the mapview.',
          );
        },
      );

      /**
       * This test is used to check if we can add multiple layers to the mapview.
       * @function it
       */
      codi.it(
        {
          name: 'Add multiple layer to mapview.',
          parentId: 'mapview_add_layer',
        },
        async () => {
          const layer_1 = {
            key: 'layer_test_2',
            format: 'tiles',
            URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          };

          const layer_2 = {
            key: 'layer_test_3',
            format: 'tiles',
            URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          };

          const layers = await mapview.addLayer([layer_1, layer_2]);

          codi.assertEqual(
            layers.length,
            2,
            'We expect to see 2 layer being returned from getLayers method.',
          );
          codi.assertTrue(
            layers[0].show instanceof Function,
            'The first decorated layer has a show method.',
          );
          codi.assertTrue(
            Object.hasOwn(mapview.layers, layers[0].key),
            'The first layer has been added to the mapview.',
          );
          codi.assertFalse(
            layers[0] === layers[1],
            'The layers returned from the addLayer method should not be equal even if they have the exactly the same config',
          );
        },
      );
    },
  );
}
