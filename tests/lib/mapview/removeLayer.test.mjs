/**
 * This is the remove layer test module for the mapview.
 * @module lib/mapview/removeLayer
 */

/**
 * The entry point test that is used to test the remove layer module for a mapview.
 * @param {Object} mapview
 * @function removeLayer
 */
export async function removeLayer(mapview) {
  const layer_1 = {
    key: 'layer_test_1',
    format: 'tiles',
    URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  const layer_2 = {
    key: 'layer_test_2',
    format: 'tiles',
    URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  const layer_3 = {
    key: 'layer_test_3',
    format: 'tiles',
    URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  codi.describe(
    {
      name: 'removeLayer Test',
      id: 'mapview_remove_layer',
      parentId: 'mapview',
    },
    async () => {
      await mapview.addLayer([layer_1, layer_2, layer_3]);

      /**
       * This test is used to check if we can remove a single layer from the mapview.
       * @function it
       */
      codi.it(
        {
          name: 'Remove layers from mapview.',
          parentId: 'mapview_remove_layer',
        },
        async () => {
          await mapview.removeLayer([
            'layer_test_1',
            'layer_test_2',
            'layer_test_3',
          ]);
          codi.assertTrue(
            !Object.keys(mapview.layers).includes([
              'layer_test_1',
              'layer_test_2',
              'layer_test_3',
            ]),
            'The mapview shoul not longer have the test layers',
          );
        },
      );
    },
  );
}
