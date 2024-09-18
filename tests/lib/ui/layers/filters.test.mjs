export async function filtersTest(mapview) {
    await codi.describe('UI Layers: Filters test', async () => {
        await codi.it('Should generate correct min/max values', async () => {

            const filter = {
                field: 'field',
                minmax_query: 'minmax_query_mock'
            };

            const layer = mapview.layers['location_get_test'];

            const minMax = await mapp.ui.layers.filters.generateMinMax(layer, filter);

            codi.assertEqual(minMax.min, 100, 'The min should return 100');
            codi.assertEqual(minMax.max, 500, 'The max should return 500');
        });
    });
}