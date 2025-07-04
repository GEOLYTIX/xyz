import ukFeatures from '../../../../assets/data/uk.json';
import geojsonLayer from '../../../../assets/layers/geojson/layer.json';

import { mockLocation } from '../../../../utils/location.js';
/**
 * ## locations.entries.pinTest()
 * @module ui/elements/pinTest
 */
/**
 * This test is used to test the creation of the pin ui element.
 * @function pinTest
 */
export async function pin(mapview) {
  await codi.describe(
    {
      name: 'pin test:',
      id: 'ui_locations_entries_pin',
      parentId: 'ui_locations_entries',
    },
    async () => {
      await codi.it(
        {
          name: 'Needs to be able to create a pin element with a scale of 4',
          parentId: 'ui_locations_entries_pin',
        },
        async () => {
          const layerParams = {
            ...geojsonLayer,
            key: 'ui_locations_entries_pin',
            featureLocation: true,
          };

          layerParams.features = ukFeatures.features;

          layerParams.infoj.find((entry) => entry.type === 'pin').style ??= {
            icon: { scale: 4 },
          };

          const [layer] = await mapview.addLayer(layerParams);

          const location = await mapp.location.get({
            layer: layer,
            getTemplate: 'get_location_mock',
            id: 6,
          });

          //Get the pinEntry from the location
          const [pinEntry] = location.infoj.filter(
            (entry) => entry.type === 'pin',
          );

          codi.assertTrue(
            !!pinEntry.style,
            'The pinEntry needs to have a style object',
          );
          codi.assertTrue(
            !!pinEntry.style.icon,
            'The pinEntry needs to have an icon assigned to the style',
          );
          codi.assertEqual(
            pinEntry.style.icon.scale,
            4,
            'The pinEntry needs to have an scale property on the icon set to 4',
          );

          mapp.ui.locations.entries.pin(pinEntry);

          codi.assertTrue(
            !!pinEntry.getExtent(),
            'The pin entry should have an extent function.',
          );

          //remove the location
          location.removeCallbacks.push(
            (_this) => delete _this.removeCallbacks,
          );
          location.remove();

          await mapview.removeLayer(layerParams.key);
        },
      );
    },
  );
}
