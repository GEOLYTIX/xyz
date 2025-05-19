import ukFeatures from '../../../../assets/data/uk.json';
import geojsonLayerDefault from '../../../../assets/layers/geojson/layer.json';

export function layer(mapview) {
  codi.describe(
    {
      id: 'ui_locations_entries_layer',
      name: 'Layer:',
      parentId: 'ui_locations_entries',
    },
    async () => {
      const custom_config = {
        key: 'layer_entry_test',
        featureLocation: true,
      };

      const layer_params = {
        ...geojsonLayerDefault,
        ...custom_config,
      };

      layer_params.features = ukFeatures.features;

      layer_params.params = {
        fields: ['id', 'name', 'description', 'geom_4326'],
      };

      await mapview.addLayer(layer_params);

      const test_entry = {
        type: 'vector_layer',
        display: true,
        layer: 'layer_entry_test',
        mapview,
      };

      const result = mapp.ui.locations.entries.layer(test_entry);

      console.log(result);
    },
  );
}
