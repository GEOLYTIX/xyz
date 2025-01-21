import geojsonLayer from '../../../assets/layers/geojson/layer.json';
/**
 * This is the entry point function for the ui/layers/filters test
 * @function filtersTest
 * @param {object} mapview
 */
export function filters(mapview) {
  codi.describe(
    { name: 'Filters test:', id: 'ui_layers_filters', parentId: 'ui_layers' },
    async () => {
      //Creating the filter to be used in other tests
      const filter = {
        field: 'id',
        minmax_query: 'minmax_query',
      };

      const layerParams = {
        ...geojsonLayer,
      };

      layerParams.key = 'ui_layers_filter_test';

      const [layer] = await mapview.addLayer(layerParams);

      /**
       * Testing providing an explicit max value on the filter.
       * @function it
       */
      codi.it(
        {
          name: 'Numeric Filter: max value specified',
          parentId: 'ui_layers_filters',
        },
        async () => {
          filter['min'] = 200;
          filter['max'] = 1000;

          const numericFilter = await mapp.ui.layers.filters.numeric(
            layer,
            filter,
          );
          const minInput = numericFilter.querySelector(
            'div > input[type=range]:nth-child(3)',
          );
          const maxInput = numericFilter.querySelector(
            'div > input[type=range]:nth-child(4)',
          );

          codi.assertEqual(minInput.value, '200', 'The min should return 100.');
          codi.assertEqual(
            maxInput.value,
            '1000',
            'The max should return 1000',
          );
        },
      );

      /**
       * Testing providing a layer.current as explicit values.
       * @function it
       */
      codi.it(
        {
          name: 'Numeric Filter: layer.current specified as `lte: 200` and `gte: 800`',
          parentId: 'ui_layers_filters',
        },
        async () => {
          layer.filter.current[filter.field].lte = 800;
          layer.filter.current[filter.field].gte = 200;

          const numericFilter = await mapp.ui.layers.filters.numeric(
            layer,
            filter,
          );
          const minInput = numericFilter.querySelector(
            'div > input[type=range]:nth-child(3)',
          );
          const maxInput = numericFilter.querySelector(
            'div > input[type=range]:nth-child(4)',
          );

          codi.assertEqual(minInput.value, '200', 'The min should return 200.');
          codi.assertEqual(maxInput.value, '800', 'The max should return 800');

          await mapp.ui.layers.filters.removeFilter(layer, filter);

          codi.assertEqual(
            layer.filter.current,
            {},
            'The filter of the layer should be cleared',
          );
        },
      );

      await mapview.removeLayer(layerParams.key);
    },
  );
}
