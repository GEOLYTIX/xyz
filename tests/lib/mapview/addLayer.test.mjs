/**
 * This is the add layer test module for the mapview.
 * @module lib/mapview/addLayer
 */

/**
 * The entry point test that is used to test the add layer module for a mapview.
 * @param {Object} mapview
 * @function addLayerTest
 */
export async function addLayerTest(mapview) {
  const OL = document.getElementById('OL');

  const _mapview = await mapp.Mapview({
    host: mapp.host,
    target: OL,
    locale: mapview.locale,
    svgTemplates: mapview.locale.svg_templates,
  });

  await codi.describe('Mapview: addLayerTest', async () => {
    /**
     * This test is used to check if we can add a single layer to the mapview.
     * @function it
     */
    await codi.it('Add single layer to mapview.', async () => {
      const layer = {
        format: 'tiles',
        URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      };

      const layers = await _mapview.addLayer(layer);

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
        Object.hasOwn(_mapview.layers, layers[0].key),
        'The layer has been added to the mapview.',
      );
    });

    /**
     * This test is used to check if we can add multiple layers to the mapview.
     * @function it
     */
    await codi.it('Add multiple layer to mapview.', async () => {
      const layer = {
        format: 'tiles',
        URI: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      };

      const layers = await _mapview.addLayer([layer, layer]);

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
        Object.hasOwn(_mapview.layers, layers[0].key),
        'The first layer has been added to the mapview.',
      );
      codi.assertFalse(
        layers[0] === layers[1],
        'The layers returned from the addLayer method should not be equal even if they have the exactly the same config',
      );
    });
  });
}
