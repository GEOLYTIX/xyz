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
      // Creating the filter to be used in other tests
      const filter = {
        field: 'id',
        type: 'numeric',
        minmax_query: 'minmax_query',
      };

      const layerParams = {
        ...geojsonLayer,
      };

      layerParams.key = 'ui_layers_filter_test';

      const [layer] = await mapview.addLayer(layerParams);

      // Ensure layer has filter structure
      if (!layer.filter) {
        layer.filter = { current: {} };
      }
      if (!layer.filter.current) {
        layer.filter.current = {};
      }

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

          const minInput = numericFilter.values[1].querySelector(
            'input[data-id="a"][type="range"]',
          );
          const maxInput = numericFilter.values[1].querySelector(
            'input[data-id="b"][type="range"]',
          );

          codi.assertEqual(minInput.value, '200', 'The min should return 200.');
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
          // Ensure filter.field object exists before setting properties
          if (!layer.filter.current[filter.field]) {
            layer.filter.current[filter.field] = {};
          }

          layer.filter.current[filter.field].lte = 800;
          layer.filter.current[filter.field].gte = 200;

          const numericFilter = await mapp.ui.layers.filters.numeric(
            layer,
            filter,
          );

          const minInput = numericFilter.values[1].querySelector(
            'input[data-id="a"][type="range"]',
          );
          const maxInput = numericFilter.values[1].querySelector(
            'input[data-id="b"][type="range"]',
          );

          codi.assertEqual(minInput.value, '200', 'The min should return 200.');
          codi.assertEqual(maxInput.value, '800', 'The max should return 800');

          await mapp.ui.layers.filters.removeFilter(layer, filter);

          codi.assertTrue(
            typeof layer.filter.current[filter.field] === 'undefined',
            'The filter of the layer should be cleared',
          );
        },
      );

      /**
       * Testing removeFilter functionality
       */
      codi.it(
        {
          name: 'removeFilter: should remove specific filter from layer',
          parentId: 'ui_layers_filters',
        },
        async () => {
          // Set up a filter first
          if (!layer.filter.current[filter.field]) {
            layer.filter.current[filter.field] = {};
          }
          layer.filter.current[filter.field] = { min: 100, max: 500 };

          // Verify filter exists before removal
          codi.assertTrue(
            layer.filter.current[filter.field] !== undefined,
            'Filter should exist before removal',
          );

          // Remove the filter
          await mapp.ui.layers.filters.removeFilter(layer, filter);

          // Verify filter is removed
          codi.assertEqual(
            layer.filter.current[filter.field],
            undefined,
            'Filter should be undefined after removal',
          );
        },
      );

      /**
       * Testing boolean filter type
       */
      codi.it(
        {
          name: 'Boolean Filter: should create checkbox filter',
          parentId: 'ui_layers_filters',
        },
        async () => {
          const booleanFilter = {
            field: 'active',
            type: 'boolean',
            label: 'Active Status',
          };

          const filterElement = mapp.ui.layers.filters.boolean(
            layer,
            booleanFilter,
          );

          codi.assertTrue(
            filterElement !== null && filterElement !== undefined,
            'Boolean filter element should be created',
          );

          // Check if it's a checkbox element
          const checkbox = filterElement.querySelector(
            'input[type="checkbox"]',
          );
          codi.assertTrue(
            checkbox !== null,
            'Boolean filter should contain a checkbox input',
          );
        },
      );

      /**
       * Testing null filter type
       */
      codi.it(
        {
          name: 'Null Filter: should create null value filter',
          parentId: 'ui_layers_filters',
        },
        async () => {
          const nullFilter = {
            field: 'description',
            type: 'null',
            label: 'Has Description',
          };

          const filterElement = mapp.ui.layers.filters.null(layer, nullFilter);

          codi.assertTrue(
            filterElement !== null && filterElement !== undefined,
            'Null filter element should be created',
          );

          // Check if it contains appropriate filter controls
          const checkbox = filterElement.querySelector(
            'input[type="checkbox"]',
          );
          codi.assertTrue(
            checkbox !== null,
            'Null filter should contain a checkbox input',
          );
        },
      );

      /**
       * Testing error handling for invalid filter
       */
      codi.it(
        {
          name: 'Error handling: should handle invalid filter gracefully',
          parentId: 'ui_layers_filters',
        },
        async () => {
          const invalidFilter = {
            field: 'nonexistent_field',
            type: 'invalid_type',
          };

          // This should not throw an error but should handle gracefully
          try {
            const result = mapp.ui.layers.filters[invalidFilter.type];
            codi.assertEqual(
              result,
              undefined,
              'Invalid filter type should return undefined',
            );
          } catch (error) {
            codi.assertTrue(
              false,
              'Should not throw error for invalid filter type',
            );
          }
        },
      );

      await mapview.removeLayer(layerParams.key);
    },
  );
}
