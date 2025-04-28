/**
 *
 * @module /ui/layers/view
 */

import clusterConfig from '../../../assets/layers/cluster/layer.json';
import { delayFunction } from '../../../utils/delay.js';
import { setView } from '../../../utils/view.js';

/**
 * This function is used as an entry point for the changeEndTest
 * @function viewTest
 * @param {Object} mapview
 */
export async function view(mapview) {
  await codi.describe(
    { name: 'View test:', id: 'ui_layers_view', parentId: 'ui_layers' },
    async () => {
      /**
       * ### should not have a zoom button.
       * 1. The Test sets the mapview to London at zoom level 11.
       * 2. Creates the `changeEnd` event and dispatches it.
       * 3. Checks the magnifying glass is not present.
       * @function it
       */
      await codi.it(
        {
          name: 'should not display a zoom button when not provided',
          parentId: 'ui_layers_view',
        },
        async () => {
          const layer = Object.assign({}, clusterConfig);

          layer.viewConfig = {
            displayToggle: true,
            zoomToExtentBtn: true,
          };

          layer.filter = {
            zoomToExtent: true,
          };

          layer.mapview = mapview;

          await mapp.layer.decorate(layer);

          await mapp.ui.layers.view(layer);

          codi.assertTrue(
            layer.displayToggle !== null,
            'We expect to see a display toggle',
          );
          codi.assertTrue(
            typeof layer.zoomToExtent === 'function',
            'We expect to see a zoomToExtent function',
          );
          codi.assertTrue(
            layer.zoomToExtentBtn !== null,
            'We expect to see a zoomToExtentBtn property',
          );
        },
      );

      /**
       * ### should not have a display toggle button.
       * 1. The Test sets the mapview to London at zoom level 11.
       * 2. Creates the `changeEnd` event and dispatches it.
       * 3. Checks the display toggle is not present.
       * @function it
       */
      await codi.it(
        {
          name: 'should not display a display Toggle button when not provided',
          parentId: 'ui_layers_view',
        },
        async () => {
          const layer = Object.assign({}, clusterConfig);

          layer.viewConfig = {};

          layer.mapview = mapview;

          await mapp.layer.decorate(layer);

          await mapp.ui.layers.view(layer);

          codi.assertTrue(
            typeof layer.zoomBtn === 'undefined',
            'We should see no zoomBtn',
          );
          codi.assertTrue(
            typeof layer.zoomToExtentBtn === 'undefined',
            'We should see no zoomToExtentBtn',
          );
          codi.assertTrue(
            typeof layer.displayToggle === 'undefined',
            'We should see no displayToggle',
          );
          codi.assertEqual(
            layer.viewConfig.panelOrder,
            [
              'draw-drawer',
              'dataviews-drawer',
              'filter-drawer',
              'style-drawer',
              'meta',
            ],
            'The panelOrder should be default',
          );
        },
      );

      /**
       * ### should have the defined panelOrder
       * 1. The Test sets the mapview to London at zoom level 11.
       * 2. Creates the `changeEnd` event and dispatches it.
       * 3. Checks the panelOrder is what's defined.
       * @function it
       */
      await codi.it(
        {
          name: 'should use the default panelOrder',
          parentId: 'ui_layers_view',
        },
        async () => {
          const layer = Object.assign({}, clusterConfig);

          layer.viewConfig = {
            panelOrder: [
              'meta',
              'style-drawer',
              'draw-drawer',
              'dataviews-drawer',
              'filter-drawer',
            ],
          };

          await mapp.layer.decorate(layer);

          await mapp.ui.layers.view(layer);

          codi.assertEqual(
            layer.viewConfig.panelOrder,
            [
              'meta',
              'style-drawer',
              'draw-drawer',
              'dataviews-drawer',
              'filter-drawer',
            ],
            'The panelOrder should be what is defined',
          );
        },
      );
    },
  );
}
