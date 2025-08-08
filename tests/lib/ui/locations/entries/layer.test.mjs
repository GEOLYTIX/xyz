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
      const originalConsole = console.warn;

      const mockWarns = [];

      console.warn = (message) => {
        mockWarns.push(message);
      };

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

      geojsonLayerDefault.zIndex = 0;

      mapview.locale.layers.push(geojsonLayerDefault);

      const test_entry = {
        type: 'vector_layer',
        display: true,
        layer: 'geojson_test',
        mapview,
        location: { id: '1234', removeCallbacks: [], Layers: [] },
        tables: {
          0: 'test.table',
          1: 'test.table',
        },
      };

      codi.it(
        { parentId: 'ui_locations_entries_layer', name: 'basic test' },
        () => {
          const result = mapp.ui.locations.entries.layer(test_entry);
          codi.assertTrue(result !== null);
        },
      );

      console.warn = originalConsole;
    },
  );
}
