/**
 * ## layer.decorateTest()
 * @module layer/decorateTest
 */

import wkt_infoj_default from '../../assets/layers/wkt/infoj.json';
import wkt_layer_default from '../../assets/layers/wkt/layer.json';
import wkt_style_default from '../../assets/layers/wkt/style.json';

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
export function decorate(mapview, layer, infoj, style) {
  layer ??= wkt_layer_default;
  infoj ??= wkt_infoj_default;
  style ??= wkt_style_default;

  codi.describe(
    { name: 'decorate test', id: 'layer_decorate', parentId: 'layer' },
    async () => {
      const infoj_skip = ['textarea'];

      layer = {
        key: 'decorate_test',
        mapview: mapview,
        ...infoj,
        infoj_skip: infoj_skip,
        ...style,
        ...layer,
      };

      await mapp.layer.decorate(layer);

      /**
       * ### Should have a hide function
       * 1. We check if the decorated layer has a hide function
       * 2. We execute the hide() function
       * 3. We check if the display is false
       * @function it
       */
      codi.it(
        { name: 'Should have a hide function', parentId: 'layer_decorate' },
        () => {
          codi.assertTrue(
            Object.hasOwn(layer, 'hide'),
            'The layer should have a hide method by default',
          );
          layer.hide();
          codi.assertFalse(layer.display, 'The layer should display as false');
        },
      );

      /**
       * ### Should not have an edit object
       * - The layer should not have an edit object as it's deprecated.
       * @function it
       */
      codi.it(
        { name: 'Should not have an edit object', parentId: 'layer_decorate' },
        () => {
          codi.assertTrue(
            !layer.edit,
            'The layer should not have an edit object as its been deprecated.',
          );
        },
      );

      /**
       * ### Should add the `skipEntry` flag to the textArea entry
       * - We check if the textArea entry on the decorate layer has the skipEntry flag.
       * @function it
       */
      codi.it(
        {
          name: 'Should add the skipEntry flag to the textArea entry',
          parentId: 'layer_decorate',
        },
        () => {
          layer.infoj
            .filter((entry) => entry.field === 'textarea')
            .forEach((entry) => {
              codi.assertTrue(
                entry.skipEntry,
                'The layer should have a hide method by default',
              );
            });
        },
      );

      /**
       * ### Should get `test.public` table at zoom level 11.
       * 1. We call the `tableCurrent()` function.
       * 2. We assert that the table returned is zool level 11.
       */
      codi.it(
        {
          name: 'Should get test.public table at zoom level 11',
          parentId: 'layer_decorate',
        },
        () => {
          const table = layer.tableCurrent();
          codi.assertTrue(typeof table === 'string');
        },
      );

      /**
       * ### Should get `geom_3857` at zoom level 11
       * 1. We call the `geomCurrent()` function.
       * 2. We then assert that the name of the geometry is geom_3857
       * @function it
       */
      codi.it(
        {
          name: 'Should get geom_3857 geom at zoom level 11',
          parentId: 'layer_decorate',
        },
        () => {
          const geom = layer.geomCurrent();
          codi.assertTrue(
            typeof geom === 'string',
            'The geometry should be returned from the layer',
          );
        },
      );
    },
  );
}
