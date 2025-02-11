/**
 * This is the entry point function for the ui/layers/filters test
 * @function filtersTest
 * @param {object} mapview
 */
export async function filtersTest(mapview) {
  await codi.describe('UI Layers: Filters test', async () => {
    //Creating the filter to be used in other tests
    const filter = {
      field: 'id',
      minmax_query: 'minmax_query',
    };

    //Getting a layer
    const layer = mapview.layers['location_get_test'];

    /**
     * This function is used to test a custom minmax query
     * This query is by design returning 100 & 500 as min max
     * @function it
     */
    await codi.it('Numeric Filter: minmax_query test', async () => {
      const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
      const minInput = numericFilter.querySelector(
        'div > input[type=range]:nth-child(3)',
      );
      const maxInput = numericFilter.querySelector(
        'div > input[type=range]:nth-child(4)',
      );

      codi.assertEqual(minInput.value, '100', 'The min should return 100.');
      codi.assertEqual(maxInput.value, '500', 'The max should return 500');
    });

    /**
     * Testing providing an explicit min value on the filter.
     * @function it
     */
    await codi.it('Numeric Filter: min value specified', async () => {
      filter['min'] = 200;

      const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
      const minInput = numericFilter.querySelector(
        'div > input[type=range]:nth-child(3)',
      );
      const maxInput = numericFilter.querySelector(
        'div > input[type=range]:nth-child(4)',
      );

      codi.assertEqual(minInput.value, '200', 'The min should return 200.');
      codi.assertEqual(maxInput.value, '500', 'The max should return 500');

      //Delete the lte value of the current filter otherwise it will not be changed in the next test
      await mapp.ui.layers.filters.removeFilter(layer, filter);

      //Delete the min value from the filter
      delete filter.min;
    });

    /**
     * Testing providing an explicit max value on the filter.
     * @function it
     */
    await codi.it('Numeric Filter: max value specified', async () => {
      filter['max'] = 1000;

      const numericFilter = await mapp.ui.layers.filters.numeric(layer, filter);
      const minInput = numericFilter.querySelector(
        'div > input[type=range]:nth-child(3)',
      );
      const maxInput = numericFilter.querySelector(
        'div > input[type=range]:nth-child(4)',
      );

      codi.assertEqual(minInput.value, '100', 'The min should return 100.');
      codi.assertEqual(maxInput.value, '1000', 'The max should return 1000');
    });

    /**
     * Testing providing a layer.current as explicit values.
     * @function it
     */
    await codi.it(
      'Numeric Filter: layer.current specified as `lte: 200` and `gte: 800`',
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
  });
}
